import express from 'express';
import { getProducts, getAdminProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleBlockProduct } from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/admin', protect, admin, getAdminProducts);
  
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.patch('/:id/block', protect, admin, toggleBlockProduct);

export default router;
