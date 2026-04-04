import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { initiateCheckout, getCheckoutStatus, cancelCheckout } from '../controllers/checkoutController.js';

const router = express.Router();

router.use(protect); // All checkout routes require authentication

router.post('/initiate', initiateCheckout);
router.get('/status', getCheckoutStatus);
router.post('/cancel', cancelCheckout);

export default router;
