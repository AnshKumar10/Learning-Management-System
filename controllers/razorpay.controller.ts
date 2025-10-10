import Razorpay from 'razorpay';
import type { Request, RequestHandler, Response } from 'express';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createRazorpayOrder: RequestHandler = async (
  request: Request,
  response: Response,
) => {};

export const verifyPayment = async (request: Request, response: Response) => {};
