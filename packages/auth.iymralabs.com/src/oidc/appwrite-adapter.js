import { Client, Databases, ID, Query } from '@node-appwrite/sdk';

export class AppwriteAdapter {
  static createAdapter() {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const db = new Databases(client);
    
    return new AppwriteAdapter(db);
  }

  constructor(db) {
    this.db = db;
    this.database = process.env.APPWRITE_DATABASE_ID;
    this.collections = {
      clients: process.env.APPWRITE_OAUTH_CLIENTS_COLLECTION_ID,
      tokens: process.env.APPWRITE_OAUTH_TOKENS_COLLECTION_ID,
      interactions: process.env.APPWRITE_OAUTH_INTERACTIONS_COLLECTION_ID,
    };
  }

  async upsert(name, id, payload, expiresIn) {
    const collection = this.collections[name];
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    try {
      await this.db.getDocument(this.database, collection, id);
      return await this.db.updateDocument(this.database, collection, id, {
        ...payload,
        ...(expiresAt && { expiresAt }),
      });
    } catch {
      return await this.db.createDocument(this.database, collection, id, {
        ...payload,
        ...(expiresAt && { expiresAt }),
      });
    }
  }

  async find(name, id) {
    try {
      const doc = await this.db.getDocument(
        this.database,
        this.collections[name],
        id
      );
      if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
        await this.destroy(name, id);
        return undefined;
      }
      return doc;
    } catch {
      return undefined;
    }
  }

  async findByUserCode(userCode) {
    const docs = await this.db.listDocuments(
      this.database,
      this.collections.tokens,
      [Query.equal('userCode', userCode)]
    );
    return docs.documents[0];
  }

  async destroy(name, id) {
    try {
      await this.db.deleteDocument(
        this.database,
        this.collections[name],
        id
      );
    } catch {
      // Ignore if document doesn't exist
    }
  }

  async revokeByGrantId(grantId) {
    const docs = await this.db.listDocuments(
      this.database,
      this.collections.tokens,
      [Query.equal('grantId', grantId)]
    );
    
    await Promise.all(
      docs.documents.map(doc =>
        this.destroy('tokens', doc.$id)
      )
    );
  }
}