import { redisClient } from '../config/redis.js';
import { releaseReservation } from '../controllers/checkoutController.js';
import logger from '../utils/logger.js';

export const initCheckoutExpiryListener = async () => {
    // 1. Enable keyspace notifications if not already enabled
    try {
        await redisClient.configSet('notify-keyspace-events', 'Ex');
        logger.info('Redis keyspace notifications enabled (Ex)');
    } catch (err) {
        logger.warn('Failed to set Redis config notify-keyspace-events. Ensure it is enabled manually if auto-release fails.');
    }

    // 2. Create a separate client for subscription (redis-om or standard ioredis needs a dedicated conn)
    // Assuming standard node-redis client
    const subscriber = redisClient.duplicate();
    await subscriber.connect();

    // 3. Subscribe to the expiration events
    // Format: __keyevent@<db>__:expired
    const expiryChannel = '__keyevent@0__:expired';

    await subscriber.subscribe(expiryChannel, async (message) => {
        // message is the key that expired: checkout:timer:{userId}
        if (message.startsWith('checkout:timer:')) {
            const userId = message.split(':')[2];
            logger.info(`Checkout session expired for user: ${userId}. Releasing inventory...`);
            
            try {
                await releaseReservation(userId);
            } catch (err) {
                logger.error(`Error releasing reservation for expired session ${userId}: ${err.message}`);
            }
        }
    });

    logger.info('Checkout expiry listener initialized');
};
