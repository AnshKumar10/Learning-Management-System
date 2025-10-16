import type { Request, RequestHandler, Response } from 'express';
import { catchAsync } from '@middlewares/error.middleware';
import Stripe from 'stripe';
import { env } from '@configs/env.config';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import { Course } from '@/models/course.model';
import { CoursePurchase } from '@/models/coursePurchase.model';
import { Lecture } from '@/models/lecture.model';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe checkout session for course purchase
 * @route POST /api/v1/purchase/checkout/session
 */
export const initiateStripeCheckout: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.body;
    const userId = request.id as string;

    const course = await Course.findById(courseId);

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/course-progress/${courseId}`,
      cancel_url: `${process.env.CLIENT_URL}/course-detail/${courseId}`,
      metadata: { courseId, userId },
      shipping_address_collection: {
        allowed_countries: ['IN']
      },
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: course.title,
              images: []
            },
            unit_amount: course.price * 100 // Amount in paise
          },
          quantity: 1
        }
      ]
    });

    if (!session.url) {
      return sendErrorResponse({
        response,
        message: 'Unable to create a Stripe checkout session. Please try again.'
      });
    }

    const purchase = await CoursePurchase.create({
      course: courseId,
      user: userId,
      amount: course.price,
      paymentId: session.id,
      status: 'pending',
      paymentMethod: 'stripe'
    });

    sendSuccessResponse({
      response,
      message: 'Stripe checkout session created successfully.',
      data: { sessionUrl: session.url, purchase }
    });
  }
);

/**
 * Handle Stripe webhook events
 * @route POST /api/v1/purchase/webhook
 */
export const handleStripeWebhook: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const payloadString = JSON.stringify(request.body, null, 2);
    const secret = env.STRIPE_WEBHOOK_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret
    });

    const event = stripe.webhooks.constructEvent(payloadString, header, secret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id
      }).populate({
        path: 'course',
        select: 'lectures'
      });

      if (!purchase) {
        return sendErrorResponse({
          response,
          message: 'No matching purchase record found for this payment session.'
        });
      }

      purchase.amount = session.amount_total
        ? session.amount_total / 100
        : purchase.amount;

      purchase.status = 'completed';

      await purchase.save();

      if (purchase && purchase.course && 'lectures' in purchase.course) {
        await Lecture.updateMany(
          { _id: { $in: purchase.course.lectures } },
          { $set: { isPreview: true } }
        );
      }
    }

    sendSuccessResponse({
      response,
      message: 'Webhook event processed successfully.',
      data: null
    });
  }
);

/**
 * Get course details with purchase status
 * @route GET /api/v1/purchase/courses/:courseId/purchase-status
 */
export const getCoursePurchaseStatus: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;

    const course = await Course.findById(courseId)
      .populate('instructor', 'name avatar')
      .populate('lectures', 'title videoUrl duration');

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const purchase = await CoursePurchase.exists({
      user: request.id,
      course: courseId,
      status: 'completed'
    });

    sendSuccessResponse({
      response,
      message: 'Fetched course purchase status successfully.',
      data: { isPurchased: !!purchase, course }
    });
  }
);

/**
 * Get all purchased courses
 * @route GET /api/v1/purchase
 */
export const getPurchasedCourses: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const purchasedCourses = await CoursePurchase.find({
      user: request.id,
      status: 'completed'
    }).populate({
      path: 'course',
      select: 'title subtitle description category thumbnail',
      populate: {
        path: 'instructor',
        select: 'name avatar'
      }
    });

    sendSuccessResponse({
      response,
      message: purchasedCourses.length
        ? 'Fetched all purchased courses successfully.'
        : 'No purchased courses found.',
      data: { courses: purchasedCourses }
    });
  }
);
