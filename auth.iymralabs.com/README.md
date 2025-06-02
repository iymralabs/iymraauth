# Iymra Auth v2

OAuth 2.0 + OpenID Connect provider for Iymra Labs, built with:
- Node.js + Express
- oidc-provider
- React 18 + TypeScript
- Appwrite

## Features

- OAuth 2.0 Authorization Code flow with PKCE
- OpenID Connect core functionality
- JWT access & ID tokens (RS256)
- Refresh token rotation
- Admin interface for client management

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Security

- PKCE required for all clients
- RS256 JWTs with 15-minute expiry
- Refresh token rotation & family invalidation
- Rate limiting on critical endpoints
- Strict CSP & security headers
- Secure cookie configuration

## cPanel Deployment

1. Create Node.js application:
   - Go to cPanel > Setup Node.js App
   - Create application: auth-v2
   - Node version: 20.x LTS
   - Start file: server/src/server.js
   - Environment: Production

2. Application setup:
   ```bash
   cd apps/auth-v2
   npm install --production
   npm run build
   ```

3. Environment variables:
   - Set all variables from .env.example in cPanel Node.js App UI
   - Click "Restart" after saving variables

4. Force HTTPS:
   Create/update .htaccess:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

5. Start the application in cPanel Node.js App UI

The site should now be live at https://auth.iymralabs.com