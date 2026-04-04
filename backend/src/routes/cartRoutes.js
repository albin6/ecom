import express from 'express';
import { getCart, syncCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart routes require authentication

router.route('/')
  .get(getCart)
  .post(syncCart)
  .delete(clearCart);

export default router;
