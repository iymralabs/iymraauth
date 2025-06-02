import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Client, Databases, ID, Query } from "appwrite";
import { sendVerificationEmail } from "../services/email.js";
import env from "../config.js";

const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(env.APPWRITE_PROJECT_ID || "683c7c25003595dceabc");

const databases = new Databases(client);

const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = env.APPWRITE_USERS_COLLECTION_ID;
const VERIFICATION_TOKENS_COLLECTION_ID =
  env.APPWRITE_VERIFICATION_TOKENS_COLLECTION_ID;
const REFRESH_TOKENS_COLLECTION_ID = env.APPWRITE_REFRESH_TOKENS_COLLECTION_ID;

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, address, ...profileData } =
      req.body;

    const addressFields = {
      addressLine1: address?.line1 || "",
      addressLine2: address?.line2 || "",
      addressCity: address?.city || "",
      addressState: address?.state || "",
      addressZip: address?.zip || "",
      addressCountry: address?.country || "",
    };

    const existingUsers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (existingUsers.documents.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const user = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        ...profileData,
        ...addressFields,
      }
    );

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    await databases.createDocument(
      DATABASE_ID,
      VERIFICATION_TOKENS_COLLECTION_ID,
      ID.unique(),
      {
        userId: user.$id,
        token: verificationToken,
        expires: verificationTokenExpiry.toISOString(),
        createdAt: now,
      }
    );

    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, firstName, verificationUrl);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token)
      return res
        .status(400)
        .json({ message: "Verification token is required" });

    const verificationTokens = await databases.listDocuments(
      DATABASE_ID,
      VERIFICATION_TOKENS_COLLECTION_ID,
      [Query.equal("token", token)]
    );

    if (verificationTokens.documents.length === 0) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const verificationToken = verificationTokens.documents[0];
    if (new Date(verificationToken.expires) < new Date()) {
      return res
        .status(410)
        .json({ message: "Verification token has expired" });
    }

    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      verificationToken.userId,
      {
        emailVerified: true,
        updatedAt: new Date().toISOString(),
      }
    );

    await databases.deleteDocument(
      DATABASE_ID,
      VERIFICATION_TOKENS_COLLECTION_ID,
      verificationToken.$id
    );

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] Attempt:", email);

    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (users.documents.length === 0) {
      console.log("[LOGIN] User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users.documents[0];
    console.log("[LOGIN] User found, emailVerified:", user.emailVerified);

    if (!user.emailVerified) {
      console.log("[LOGIN] Email not verified");
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log("[LOGIN] Incorrect password");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { userId: user.$id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);

    await databases.createDocument(
      DATABASE_ID,
      REFRESH_TOKENS_COLLECTION_ID,
      ID.unique(),
      {
        userId: user.$id,
        token: refreshToken,
        expires: refreshTokenExpiry.toISOString(),
        createdAt: new Date().toISOString(),
      }
    );

    const { passwordHash, ...userData } = user;

    res.status(200).json({
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token is required" });

    const refreshTokens = await databases.listDocuments(
      DATABASE_ID,
      REFRESH_TOKENS_COLLECTION_ID,
      [Query.equal("token", refreshToken)]
    );

    if (refreshTokens.documents.length === 0) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const storedRefreshToken = refreshTokens.documents[0];
    if (new Date(storedRefreshToken.expires) < new Date()) {
      await databases.deleteDocument(
        DATABASE_ID,
        REFRESH_TOKENS_COLLECTION_ID,
        storedRefreshToken.$id
      );
      return res.status(401).json({ message: "Refresh token has expired" });
    }

    const user = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      storedRefreshToken.userId
    );

    const accessToken = jwt.sign(
      { userId: user.$id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const refreshTokens = await databases.listDocuments(
        DATABASE_ID,
        REFRESH_TOKENS_COLLECTION_ID,
        [Query.equal("token", refreshToken)]
      );
      if (refreshTokens.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          REFRESH_TOKENS_COLLECTION_ID,
          refreshTokens.documents[0].$id
        );
      }
    }
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Authentication required" });

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};
