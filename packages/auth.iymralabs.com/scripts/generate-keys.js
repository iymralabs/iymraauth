import { generateKeyPair } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JWKS_PATH = process.env.OIDC_JWKS_PATH || '../secrets/jwks.json';

function generateRSAKeyPair() {
  return new Promise((resolve, reject) => {
    generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    }, (err, publicKey, privateKey) => {
      if (err) reject(err);
      else resolve({ publicKey, privateKey });
    });
  });
}

async function main() {
  try {
    const { publicKey, privateKey } = await generateRSAKeyPair();
    
    const jwks = {
      keys: [{
        kty: 'RSA',
        kid: '1',
        use: 'sig',
        alg: 'RS256',
        // Convert PEM to JWK components
        // This is a placeholder - implement proper PEM to JWK conversion
        n: publicKey,
        e: 'AQAB',
      }]
    };

    // Ensure directory exists
    mkdirSync(dirname(JWKS_PATH), { recursive: true });
    
    // Save JWKS
    writeFileSync(JWKS_PATH, JSON.stringify(jwks, null, 2));
    console.log('Generated new RSA keypair and saved JWKS');
  } catch (error) {
    console.error('Failed to generate keys:', error);
    process.exit(1);
  }
}

main();