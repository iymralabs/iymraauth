import { generateKeyPair } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JWKS_PATH = process.env.OIDC_JWKS_PATH || join(__dirname, '../secrets/jwks.json');

async function generateJWKS() {
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
    // Create secrets directory if it doesn't exist
    await mkdir(dirname(JWKS_PATH), { recursive: true });
    
    const { publicKey, privateKey } = await generateJWKS();
    
    const jwks = {
      keys: [{
        kty: 'RSA',
        kid: new Date().toISOString(),
        use: 'sig',
        alg: 'RS256',
        key: privateKey,
        publicKey
      }]
    };
    
    await writeFile(JWKS_PATH, JSON.stringify(jwks, null, 2));
    console.log(`JWKS generated at ${JWKS_PATH}`);
  } catch (error) {
    console.error('Failed to generate JWKS:', error);
    process.exit(1);
  }
}

main();