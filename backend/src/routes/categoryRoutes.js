import express from 'express';
import { 
  getCategories, getAdminCategories, getCategoryById, 
  createCategory, updateCategory, deleteCategory, toggleBlockCategory 
} from '../controllers/categoryController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.get('/admin', protect, admin, getAdminCategories);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

router.patch('/:id/block', protect, admin, toggleBlockCategory);

export default router;
