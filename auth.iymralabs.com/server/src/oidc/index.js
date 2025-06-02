import { Provider } from 'oidc-provider';
import { AppwriteAdapter } from './appwrite-adapter.js';

export function buildOidcProvider(issuer, config) {
  const adapter = new AppwriteAdapter(config.appwrite);
  
  return new Provider(issuer, {
    adapter: adapter,
    
    clients: [],
    
    cookies: {
      keys: config.cookieKeys,
      long: { signed: true, secure: true, sameSite: 'lax' },
      short: { signed: true, secure: true, sameSite: 'lax' }
    },
    
    features: {
      devInteractions: { enabled: false },
      clientCredentials: { enabled: true },
      rpInitiatedLogout: { enabled: true },
      introspection: { enabled: true },
      revocation: { enabled: true },
      
      pkce: {
        required: () => true,
        methods: ['S256']
      }
    },
    
    ttl: {
      AccessToken: config.ttl.access,
      RefreshToken: config.ttl.refresh,
      IdToken: config.ttl.access
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
        'updated_at'
      ]
    },
    
    jwks: config.jwks
  });
}