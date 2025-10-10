import express from 'express';
import {
  authenticateUser,
  changeUserPassword,
  createUserAccount,
  deleteUserAccount,
  getCurrentUserProfile,
  signOutUser,
  updateUserProfile,
} from '@controllers/user.controller.js';
import { isAuthenticated } from '@middlewares/auth.middleware.js';
import upload from '@utils/multer.js';
import { validateRequestPayload } from '@middlewares/validation.middleware.js';
import {
  passwordChangeSchema,
  signinSchema,
  signupSchema,
} from '@/validations/user.js';

const router = express.Router();

// Auth routes
router.post('/signup', validateRequestPayload(signupSchema), createUserAccount);
router.post('/signin', validateRequestPayload(signinSchema), authenticateUser);
router.post('/signout', signOutUser);

// Profile routes
router.get('/profile', isAuthenticated, getCurrentUserProfile);
router.patch(
  '/profile',
  isAuthenticated,
  upload.single('avatar'),
  updateUserProfile,
);

// Password management
router.patch(
  '/change-password',
  isAuthenticated,
  validateRequestPayload(passwordChangeSchema),
  changeUserPassword,
);

// Account management
router.delete('/account', isAuthenticated, deleteUserAccount);

export default router;
