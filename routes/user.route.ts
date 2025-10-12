import express from 'express';
import {
  signInUser,
  changeUserPassword,
  createUserAccount,
  deleteUserAccount,
  getCurrentUserProfile,
  signOutUser,
  updateUserProfile
} from '@controllers/user.controller';
import { isAuthenticated } from '@middlewares/auth.middleware';
import upload from '@utils/multer';
import { validateRequestPayload } from '@middlewares/validation.middleware';
import {
  signupSchema,
  signinSchema,
  passwordChangeSchema,
  deleteAccountSchema
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

// Account management
router.delete(
  '/account',
  isAuthenticated,
  validateRequestPayload(deleteAccountSchema),
  deleteUserAccount
);

export default router;
