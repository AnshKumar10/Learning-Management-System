import Razorpay from 'razorpay';
import type { Request, RequestHandler, Response } from 'express';
import { env } from '@configs/env.config';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID!,
  key_secret: env.RAZORPAY_KEY_SECRET!,
});

export const createRazorpayOrder: RequestHandler = async (
  request: Request,
  response: Response,
) => {};

export const verifyPayment = async (request: Request, response: Response) => {};
