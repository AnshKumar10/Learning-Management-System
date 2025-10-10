import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
} from '@controllers/razorpay.controller';
import { isAuthenticated } from '@middlewares/auth.middleware';

const router = express.Router();

router.post('/create-order', isAuthenticated, createRazorpayOrder);
router.post('/verify-payment', isAuthenticated, verifyPayment);

export default router;
