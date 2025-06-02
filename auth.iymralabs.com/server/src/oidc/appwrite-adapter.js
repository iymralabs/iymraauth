import { Client, Databases } from '@node-appwrite/sdk';

export class AppwriteAdapter {
  constructor(config) {
    this.client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);
    
    this.db = new Databases(this.client);
    this.collections = config.collections;
  }

  async upsert(id, payload, expiresIn) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresIn * 1000));

    try {
      await this.db.createDocument(
        this.collections.database,
        this.collections.tokens,
        id,
        {
          ...payload,
          expiresAt: expiresAt.toISOString()
        }
      );
    } catch (error) {
      if (error.code === 409) {
        await this.db.updateDocument(
          this.collections.database,
          this.collections.tokens,
          id,
          {
            ...payload,
            expiresAt: expiresAt.toISOString()
          }
        );
      } else {
        throw error;
      }
    }
  }

  async find(id) {
    try {
      const doc = await this.db.getDocument(
        this.collections.database,
        this.collections.tokens,
        id
      );
      
      if (new Date(doc.expiresAt) < new Date()) {
        await this.destroy(id);
        return undefined;
      }
      
      return doc;
    } catch (error) {
      if (error.code === 404) return undefined;
      throw error;
    }
  }

  async consume(id) {
    await this.destroy(id);
  }

  async destroy(id) {
    try {
      await this.db.deleteDocument(
        this.collections.database,
        this.collections.tokens,
        id
      );
    } catch (error) {
      if (error.code !== 404) throw error;
    }
  }
}