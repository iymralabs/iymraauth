import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      .withMessage('Password must include letters, numbers and symbols'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  validateRequest,
  authController.register
);

// Verify email
router.get('/verify-email', authController.verifyEmail);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// Refresh token
router.post('/token/refresh', authController.refreshToken);

// Logout
router.post('/logout', requireAuth, authController.logout);

export default router;