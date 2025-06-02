import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.js';
import { requestPasswordChange, confirmPasswordChange } from '../controllers/user.js';
import { validateRequest } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get current user
router.get('/me', requireAuth, userController.getCurrentUser);

// Update current user
router.put(
  '/me',
  requireAuth,
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('dateOfBirth').optional().isDate().withMessage('Invalid date format'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  ],
  validateRequest,
  userController.updateCurrentUser
);


router.post(
  '/password/change/request',
  requireAuth,
  [body('currentPassword').notEmpty()],
  validateRequest,
  requestPasswordChange
);

router.post(
  '/password/change/confirm',
  requireAuth,
  [
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('6-digit verification code required'),
    body('newPassword')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/)
      .withMessage(
        'Password must be 8+ chars and include letters, numbers & symbols'
      ),
  ],
  validateRequest,
  confirmPasswordChange
);

export default router;