import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authLimiter, rateLimitMiddleware } from '../utils/rateLimiter.js';

const router = Router();

// Admin JWT verification middleware
const verifyAdmin = (req, res, next) => {
  // <<<TODO-ADMIN-JWT-VERIFY>>>
  next();
};

// Rate limit admin routes
router.use(rateLimitMiddleware(authLimiter));

// Create new OAuth client
router.post('/clients', verifyAdmin, async (req, res) => {
  try {
    const { name, redirectUris } = req.body;
    
    if (!name || !redirectUris || !Array.isArray(redirectUris)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Name and redirectUris array required'
      });
    }
    
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomBytes(32).toString('hex');
    const hashedSecret = await bcrypt.hash(clientSecret, 10);
    
    // <<<TODO-CREATE-CLIENT>>>
    
    // Only return secret once
    res.status(201).json({
      clientId,
      clientSecret,
      message: 'Store the client secret securely - it cannot be retrieved later'
    });
  } catch (error) {
    console.error('Failed to create client:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create OAuth client'
    });
  }
});

// List OAuth clients
router.get('/clients', verifyAdmin, async (req, res) => {
  try {
    // <<<TODO-LIST-CLIENTS>>>
    res.json({ clients: [] });
  } catch (error) {
    console.error('Failed to list clients:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to list OAuth clients'
    });
  }
});

export default router;