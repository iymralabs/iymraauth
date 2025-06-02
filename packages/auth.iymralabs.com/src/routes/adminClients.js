import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Client, Databases, ID } from '@node-appwrite/sdk';

const router = Router();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

router.post('/', async (req, res) => {
  try {
    const {
      name,
      redirectUris,
      postLogoutRedirectUris,
      scope = 'openid email profile',
    } = req.body;

    if (!name || !redirectUris?.length) {
      return res.status(400).json({
        error: 'name and redirectUris are required'
      });
    }

    // Generate client credentials
    const clientId = crypto.randomBytes(32).toString('hex');
    const clientSecret = crypto.randomBytes(64).toString('hex');
    const secretHash = await bcrypt.hash(clientSecret, 10);

    const client = await db.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_OAUTH_CLIENTS_COLLECTION_ID,
      ID.unique(),
      {
        clientId,
        secretHash,
        name,
        redirectUris,
        postLogoutRedirectUris: postLogoutRedirectUris || [],
        scope,
        createdAt: new Date().toISOString(),
      }
    );

    // Only return secret once
    res.status(201).json({
      clientId,
      clientSecret,
      name: client.name,
      redirectUris: client.redirectUris,
    });
  } catch (error) {
    console.error('Failed to create OAuth client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

export default router;