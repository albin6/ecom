import { redisClient } from '../config/redis.js';
import { productRepository } from '../repositories/productRepository.js';

/**
 * Lua script for atomic checkout initiation.
 * logic:
 * 1. Check if session already exists.
 * 2. For each item, check if (DB_STOCK - SUM(REDIS_RESERVATIONS)) >= REQUESTED_QTY.
 * 3. If all OK, create session and set reservations.
 */
const INITIATE_CHECKOUT_LUA = `
  local userId = ARGV[1]
  local sessionKey = KEYS[1]
  local timerKey = KEYS[2]
  local ttl = tonumber(ARGV[2])
  local itemsCount = tonumber(ARGV[3])
  
  -- 1. Check existing session
  if redis.call("EXISTS", sessionKey) == 1 then
    return {err = "SESSION_ALREADY_ACTIVE"}
  end

  -- 2. Validate all items
  -- ARGV layout: [1]=userId, [2]=ttl, [3]=itemsCount, [4]=itemsJSON, [5+]=pid,color,size,qty,dbStock per item
  for i = 1, itemsCount do
    local idx = 4 + (i - 1) * 5
    local pid = ARGV[idx + 1]
    local color = ARGV[idx + 2]
    local size = ARGV[idx + 3]
    local requestedQty = tonumber(ARGV[idx + 4])
    local dbStock = tonumber(ARGV[idx + 5])
    
    local reservedKey = "checkout:reserved:" .. pid .. ":" .. color .. ":" .. size
    local currentlyReserved = 0
    local allReserved = redis.call("HGETALL", reservedKey)
    for j = 2, #allReserved, 2 do
      currentlyReserved = currentlyReserved + tonumber(allReserved[j])
    end

    if (dbStock - currentlyReserved) < requestedQty then
      return {err = "INSUFFICIENT_STOCK", product = pid, color = color, size = size}
    end
  end

  -- 3. All items validated, perform reservation
  for i = 1, itemsCount do
    local idx = 4 + (i - 1) * 5
    local pid = ARGV[idx + 1]
    local color = ARGV[idx + 2]
    local size = ARGV[idx + 3]
    local requestedQty = ARGV[idx + 4]
    
    local reservedKey = "checkout:reserved:" .. pid .. ":" .. color .. ":" .. size
    redis.call("HSET", reservedKey, userId, requestedQty)
  end

  -- 4. Store session details
  redis.call("SET", sessionKey, ARGV[4]) -- ARGV[4] is the items JSON
  redis.call("SETEX", timerKey, ttl, "ACTIVE")
  
  return "OK"
`;

export const initiateCheckout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { items: orderItems } = req.body; // Array of { product, qty, color, size }

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    // 1. Fetch current DB stock for all items
    const productIds = [...new Set(orderItems.map(i => i.product))];
    const products = await productRepository.find({ _id: { $in: productIds } });

    const itemValidationData = [];
    orderItems.forEach(item => {
      // Validate presence of required variant identifiers
      if (!item.color || !item.size) {
        res.status(400);
        throw new Error(`Color and size are required for product: ${item.product}`);
      }

      const product = products.find(p => p._id.toString() === item.product);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      
      const variant = product.variants.find(v => v.color === item.color);
      if (!variant) throw new Error(`Variant not found: ${item.color}`);
      
      const size = variant.sizes.find(s => s.size === item.size);
      if (!size) throw new Error(`Size not found: ${item.size}`);

      itemValidationData.push(item.product, item.color, item.size, item.qty, size.stock);
    });

    // 2. Execute Lua script
    const sessionKey = `checkout:session:${userId}`;
    const timerKey = `checkout:timer:${userId}`;
    const ttl = 600; // 10 minutes

    // Pass items JSON as the 4th argument (after userId, ttl, itemsCount)
    const result = await redisClient.eval(INITIATE_CHECKOUT_LUA, {
      keys: [sessionKey, timerKey],
      arguments: [
        userId, 
        ttl.toString(), 
        orderItems.length.toString(), 
        JSON.stringify(orderItems),
        ...itemValidationData.map(v => v.toString())
      ]
    });

    if (result && result.err) {
      if (result.err === 'SESSION_ALREADY_ACTIVE') {
        return res.status(409).json({ message: 'You have an active checkout session on another device.' });
      }
      if (result.err === 'INSUFFICIENT_STOCK') {
        return res.status(400).json({ 
          message: `Insufficient stock for ${result.color} size ${result.size}`,
          product: result.product
        });
      }
    }

    res.status(201).json({
      message: 'Checkout session initiated',
      expiresIn: ttl,
      expiresAt: new Date(Date.now() + ttl * 1000)
    });
  } catch (error) {
    next(error);
  }
};

export const getCheckoutStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const ttl = await redisClient.ttl(`checkout:timer:${userId}`);

    if (ttl <= 0) {
      return res.status(404).json({ message: 'No active checkout session' });
    }

    const sessionData = await redisClient.get(`checkout:session:${userId}`);
    res.json({
      active: true,
      expiresIn: ttl,
      items: JSON.parse(sessionData)
    });
  } catch (error) {
    next(error);
  }
};

export const cancelCheckout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await releaseReservation(userId);
    res.json({ message: 'Checkout session canceled and inventory released' });
  } catch (error) {
    next(error);
  }
};

// Helper function to release reservations (shared between controller and background task)
export const releaseReservation = async (userId) => {
  const sessionKey = `checkout:session:${userId}`;
  const timerKey = `checkout:timer:${userId}`;
  
  const sessionData = await redisClient.get(sessionKey);
  if (!sessionData) return;

  const items = JSON.parse(sessionData);
  
  // Remove user from all variant hashes
  await Promise.all(items.map(item => {
    const reservedKey = `checkout:reserved:${item.product}:${item.color}:${item.size}`;
    return redisClient.hDel(reservedKey, userId);
  }));

  // Delete session and timer
  await redisClient.del([sessionKey, timerKey]);
};
