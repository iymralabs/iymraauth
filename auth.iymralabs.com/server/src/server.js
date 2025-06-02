import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { buildOidcProvider } from './oidc/index.js';
import { cspConfig } from './utils/csp.js';
import adminRoutes from './routes/adminClients.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: cspConfig
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Static files (React client build)
app.use(express.static(join(__dirname, '../../client/dist')));

// Initialize OIDC provider
const provider = buildOidcProvider(process.env.OIDC_ISSUER, {
  appwrite: {
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    collections: {
      database: process.env.APPWRITE_DATABASE_ID,
      tokens: process.env.APPWRITE_TOKENS_COLLECTION_ID
    }
  },
  cookieKeys: process.env.OIDC_COOKIE_KEYS.split(','),
  ttl: {
    access: parseInt(process.env.OIDC_ACCESS_TTL, 10),
    refresh: parseInt(process.env.OIDC_REFRESH_TTL, 10)
  },
  jwks: JSON.parse(process.env.OIDC_JWKS_PATH)
});

// Mount OIDC routes
app.use('/oauth', provider.callback());

// Admin API routes
app.use('/api/admin', adminRoutes);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../client/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Auth server running on port ${port}`);
});