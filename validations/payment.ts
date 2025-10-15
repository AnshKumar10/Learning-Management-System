import { z } from 'zod';
import { zName, zRequiredString } from '@validations/common';

export const createRazorpayOrderSchema = z.object({
  courseId: zRequiredString('Course Id')
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: zName('Razorpay Order Id'),
  razorpay_payment_id: zName('Razorpay Payment Id'),
  razorpay_signature: zName('Razorpay Signature')
});
