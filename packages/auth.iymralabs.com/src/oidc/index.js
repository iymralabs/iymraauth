import { Provider } from 'oidc-provider';
import { readFileSync, existsSync } from 'fs';
import { AppwriteAdapter } from './appwrite-adapter.js';
import { findAccount } from './account.js';

const loadJWKS = () => {
  const path = process.env.OIDC_JWKS_PATH;
  if (!existsSync(path)) {
    throw new Error('JWKS file not found. Run npm run prestart first.');
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
};

export async function buildProvider() {
  const cookieKeys = process.env.OIDC_COOKIE_KEYS.split(',');
  
  const configuration = {
    clients: [], // Loaded from Appwrite
    cookies: {
      keys: cookieKeys,
      long: { signed: true, secure: true, sameSite: 'lax' },
      short: { signed: true, secure: true, sameSite: 'lax' },
    },
    pkce: {
      required: () => true,
    },
    features: {
      devInteractions: { enabled: false },
      clientCredentials: { enabled: true },
      introspection: { enabled: true },
      revocation: { enabled: true },
      resourceIndicators: { enabled: true },
    },
    ttl: {
      AccessToken: parseInt(process.env.OIDC_ACCESS_TTL, 10),
      RefreshToken: parseInt(process.env.OIDC_REFRESH_TTL, 10),
      IdToken: 900,
    },
    claims: {
      openid: ['sub'],
      email: ['email', 'email_verified'],
      profile: [
        'name',
        'given_name',
        'family_name',
        'middle_name',
        'nickname',
        'preferred_username',
        'profile',
        'picture',
        'website',
        'gender',
        'birthdate',
        'zoneinfo',
        'locale',
        'updated_at',
      ],
    },
    jwks: loadJWKS(),
    findAccount,
    interactions: {
      url(ctx, interaction) {
        return `/oauth/ui/${interaction.uid}`;
      },
    },
  };

  const provider = new Provider(process.env.OIDC_ISSUER, configuration);
  provider.proxy = true;

  // Use Appwrite adapter
  const adapter = AppwriteAdapter.createAdapter();
  provider.setAdapter(adapter);

  return provider;
}