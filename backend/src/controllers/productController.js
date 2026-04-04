import { productService } from '../services/productService.js';
import { z } from 'zod';

const getProductsSchema = z.object({
  keyword: z.string().transform(v => v === '' ? undefined : v).optional(),
  category: z.string().transform(v => v === '' ? undefined : v).optional(),
  page: z.string().regex(/^\d*$/).transform(v => v ? Number(v) : undefined).optional(),
  limit: z.string().regex(/^\d*$/).transform(v => v ? Number(v) : undefined).optional(),
  sort: z.string().transform(v => v === '' ? undefined : v).optional(),
  minPrice: z.string().regex(/^\d*(\.\d+)?$/).transform(v => v ? Number(v) : undefined).optional(),
  maxPrice: z.string().regex(/^\d*(\.\d+)?$/).transform(v => v ? Number(v) : undefined).optional(),
});

const sizeMutationSchema = z.object({
  size: z.string(),
  stock: z.number().int().nonnegative(),
});

const variantMutationSchema = z.object({
  color: z.string(),
  images: z.array(z.string().url()).min(3, "Min 3 images required for a color variant"),
  sizes: z.array(sizeMutationSchema),
});

const productMutationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string(),
  variants: z.array(variantMutationSchema).optional(),
  isBlocked: z.boolean().optional(),
});

export const getProducts = async (req, res, next) => {
  try {
    const filters = getProductsSchema.parse(req.query);
    filters.isAdmin = false;
    const result = await productService.getProducts(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminProducts = async (req, res, next) => {
  try {
    const filters = getProductsSchema.parse(req.query);
    filters.isAdmin = true;
    const result = await productService.getProducts(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    if (error.message === 'Product not found') res.status(404);
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = productMutationSchema.parse(req.body);
    const product = await productService.createProduct(data);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const data = productMutationSchema.partial().parse(req.body);
    const product = await productService.updateProduct(req.params.id, data);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const toggleBlockProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    const updated = await productService.updateProduct(req.params.id, { isBlocked: !product.isBlocked });
    res.json({ message: `Product ${updated.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: updated.isBlocked });
  } catch (error) {
    if (error.message === 'Product not found') res.status(404);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    if (error.message === 'Product not found') res.status(404);
    next(error);
  }
};
