import express from 'express';
import {
  signInUser,
  changeUserPassword,
  createUserAccount,
  deleteUserAccount,
  getCurrentUserProfile,
  signOutUser,
  updateUserProfile,
  resetPassword,
  forgotPassword
} from '@controllers/user.controller';
import { isAuthenticated } from '@middlewares/auth.middleware';
import upload from '@utils/multer';
import { validateRequestPayload } from '@middlewares/validation.middleware';
import {
  signupSchema,
  signinSchema,
  passwordChangeSchema,
  deleteAccountSchema,
  forgotPasswordSchema
} from '@validations/user';

const router = express.Router();

// Auth routes
router.post('/signup', validateRequestPayload(signupSchema), createUserAccount);
router.post('/signin', validateRequestPayload(signinSchema), signInUser);
router.post('/signout', signOutUser);

// Profile routes
router.get('/profile', isAuthenticated, getCurrentUserProfile);
router.patch(
  '/profile',
  isAuthenticated,
  upload.single('avatar'),
  updateUserProfile
);

// Password management
router.patch(
  '/change-password',
  isAuthenticated,
  validateRequestPayload(passwordChangeSchema),
  changeUserPassword
);
router.post(
  '/forgot-password',
  isAuthenticated,
  validateRequestPayload(forgotPasswordSchema),
  forgotPassword
);
router.post(
  '/reset-password/:token',
  isAuthenticated,
  validateRequestPayload(deleteAccountSchema),
  resetPassword
);

// Account management
router.delete(
  '/account',
  isAuthenticated,
  validateRequestPayload(deleteAccountSchema),
  deleteUserAccount
);

export default router;
