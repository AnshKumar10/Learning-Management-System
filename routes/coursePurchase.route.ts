import express from 'express';
import {
  getCoursePurchaseStatus,
  getPurchasedCourses,
  handleStripeWebhook,
  initiateStripeCheckout
} from '@controllers/coursePurchase.controller';
import { isAuthenticated } from '@middlewares/auth.middleware';
import { validateRequestPayload } from '@/middlewares/validation.middleware';
import { initiateStripeCheckoutSchema } from '@/validations/payment';

const router = express.Router();

// Create a new Stripe Checkout session for course purchase
router.post(
  '/checkout/session',
  isAuthenticated,
  validateRequestPayload(initiateStripeCheckoutSchema),
  initiateStripeCheckout
);

// Handle Stripe webhook events
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Get purchase status for a specific course
router.get('/:courseId/status', isAuthenticated, getCoursePurchaseStatus);

// Get all purchased courses
router.get('/', isAuthenticated, getPurchasedCourses);

export default router;
