import Razorpay from 'razorpay';
import type { RequestHandler } from 'express';
import { env } from '@configs/env.config';
import { catchAsync } from '@/middlewares/error.middleware';
import { Course } from '@/models/course.model';
import crypto from 'crypto';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import { CoursePurchase } from '@/models/coursePurchase.model';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET
});

/**
 * Create a new Razorpay order for a course purchase
 * @route POST /api/v1/razorpay/create-order
 */
export const createRazorpayOrder: RequestHandler = catchAsync(
  async (request, response) => {
    const userId = request.id!;
    const { courseId = '' } = request.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const order = await razorpay.orders.create({
      amount: course.price * 100, // Razorpay accepts amount in paisa
      currency: 'INR',
      receipt: `course_${courseId}_${Date.now()}`,
      notes: { courseId, userId }
    });

    const purchase = await CoursePurchase.create({
      course: courseId,
      user: userId,
      amount: course.price,
      status: 'pending',
      paymentMethod: 'razorpay',
      paymentId: order.id
    });

    return sendSuccessResponse({
      response,
      message: 'Razorpay order created successfully.',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        purchase
      }
    });
  }
);

/**
 * Verify Razorpay payment and update purchase status
 * @route POST /api/v1/razorpay/verify-payment
 */
export const verifyPayment: RequestHandler = catchAsync(
  async (request, response) => {
    const {
      razorpay_order_id = '',
      razorpay_payment_id = '',
      razorpay_signature = ''
    } = request.body;

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return sendErrorResponse({
        response,
        message: 'Payment verification failed.'
      });
    }

    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id
    });

    if (!purchase) {
      return sendErrorResponse({
        response,
        message: 'Purchase record not found for this order ID.'
      });
    }

    if (purchase.status === 'completed') {
      return sendSuccessResponse({
        response,
        message: 'Payment already verified previously.',
        data: purchase
      });
    }

    purchase.status = 'completed';
    await purchase.save();

    return sendSuccessResponse({
      response,
      message: 'Payment verified successfully. Course unlocked!',
      data: purchase
    });
  }
);
