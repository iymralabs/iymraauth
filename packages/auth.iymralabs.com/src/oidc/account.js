import { Client, Databases } from '@node-appwrite/sdk';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

export async function findAccount(ctx, sub) {
  const user = await db.getDocument(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_USERS_COLLECTION_ID,
    sub
  );

  if (!user) return undefined;

  return {
    accountId: sub,
    async claims(use, scope) {
      const claims = {
        sub,
        email: user.email,
        email_verified: user.emailVerified,
        name: `${user.firstName} ${user.lastName}`,
        given_name: user.firstName,
        family_name: user.lastName,
        updated_at: Math.floor(new Date(user.updatedAt).getTime() / 1000),
      };

      if (user.gender) claims.gender = user.gender;
      if (user.dateOfBirth) claims.birthdate = user.dateOfBirth;
      if (user.profilePhotoUrl) claims.picture = user.profilePhotoUrl;

      return claims;
    },
  };
}