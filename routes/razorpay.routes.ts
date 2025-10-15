import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment
} from '@controllers/razorpay.controller';
import { isAuthenticated } from '@middlewares/auth.middleware';
import { validateRequestPayload } from '@/middlewares/validation.middleware';
import {
  createRazorpayOrderSchema,
  verifyPaymentSchema
} from '@/validations/payment';

const router = express.Router();

router.post(
  '/create-order',
  isAuthenticated,
  validateRequestPayload(createRazorpayOrderSchema),
  createRazorpayOrder
);
router.post(
  '/verify-payment',
  isAuthenticated,
  validateRequestPayload(verifyPaymentSchema),
  verifyPayment
);

export default router;
