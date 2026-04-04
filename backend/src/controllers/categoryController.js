import { categoryService } from '../services/categoryService.js';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  isBlocked: z.boolean().optional(),
});

const getCategoriesSchema = z.object({
  keyword: z.string().transform(v => v === '' ? undefined : v).optional(),
  page: z.string().regex(/^\d*$/).transform(v => v ? Number(v) : undefined).optional(),
  limit: z.string().regex(/^\d*$/).transform(v => v ? Number(v) : undefined).optional(),
  sort: z.string().transform(v => v === '' ? undefined : v).optional(),
});

export const getCategories = async (req, res, next) => {
  try {
    const filters = getCategoriesSchema.parse(req.query);
    filters.isAdmin = false;
    const result = await categoryService.getCategories(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminCategories = async (req, res, next) => {
  try {
    const filters = getCategoriesSchema.parse(req.query);
    filters.isAdmin = true;
    const result = await categoryService.getCategories(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    if (error.message === 'Category not found') res.status(404);
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await categoryService.createCategory(data);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const category = await categoryService.updateCategory(req.params.id, data);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const toggleBlockCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    const updated = await categoryService.updateCategory(req.params.id, { isBlocked: !category.isBlocked });
    res.json({ message: `Category ${updated.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: updated.isBlocked });
  } catch (error) {
    if (error.message === 'Category not found') res.status(404);
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (error) {
    if (error.message === 'Category not found') res.status(404);
    next(error);
  }
};
