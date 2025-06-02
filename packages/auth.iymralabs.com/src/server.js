import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { buildProvider } from './oidc/index.js';
import adminClientsRouter from './routes/adminClients.js';

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 60,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) / 1000 || 300,
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Middleware
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/oauth/clients', adminClientsRouter);

// OIDC Provider
let provider;
(async () => {
  provider = await buildProvider();
  app.use('/', provider.callback());
})();

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Auth server running on port ${port}`);
});

export default app;