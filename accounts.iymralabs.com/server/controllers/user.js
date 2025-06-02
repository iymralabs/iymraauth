import { Client, Databases, ID, Query } from "appwrite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config.js";
import {
  sendVerificationEmail,
  sendPasswordChangeCode,      // ← added
} from "../services/email.js";
/* ------------------------------------------------------------------ */
/*  Appwrite init                                                     */
/* ------------------------------------------------------------------ */
const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID);

const db = new Databases(client);
const DB = env.APPWRITE_DATABASE_ID;
const USERS = env.APPWRITE_USERS_COLLECTION_ID;
const VERIFY_COL = env.APPWRITE_VERIFICATION_TOKENS_COLLECTION_ID;
const REFRESH_COL = env.APPWRITE_REFRESH_TOKENS_COLLECTION_ID;
const PW_CHANGE_COL = env.APPWRITE_PW_CHANGE_TOKENS_COLLECTION_ID;
/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
const flattenAddress = (a = {}) => ({
  ...(a.line1 !== undefined && { addressLine1: a.line1 }),
  ...(a.line2 !== undefined && { addressLine2: a.line2 }),
  ...(a.city !== undefined && { addressCity: a.city }),
  ...(a.state !== undefined && { addressState: a.state }),
  ...(a.zip !== undefined && { addressZip: a.zip }),
  ...(a.country !== undefined && { addressCountry: a.country }),
});

const toPublicUser = (doc) => {
  const {
    passwordHash,
    addressLine1,
    addressLine2,
    addressCity,
    addressState,
    addressZip,
    addressCountry,
    ...rest
  } = doc;
  return {
    ...rest,
    address: {
      line1: addressLine1 ?? "",
      line2: addressLine2 ?? "",
      city: addressCity ?? "",
      state: addressState ?? "",
      zip: addressZip ?? "",
      country: addressCountry ?? "",
    },
  };
};

const newIymraId = () =>
  crypto
    .createHmac("sha256", env.ID_SALT || "iymra-salt")
    .update(crypto.randomBytes(16))
    .digest("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12);

/* ------------------------------------------------------------------ */
/*  Routes                                                            */
/* ------------------------------------------------------------------ */

// GET  /api/me
export const getCurrentUser = async (req, res, next) => {
  try {
    const doc = await db.getDocument(DB, USERS, req.user.userId);
    res.json(toPublicUser(doc));
  } catch (e) {
    next(e);
  }
};

// PUT /api/me
export const updateCurrentUser = async (req, res, next) => {
  try {
    const { address, email, emailVerified, passwordHash, ...rest } = req.body;
    const payload = {
      ...rest,
      ...flattenAddress(address),
      updatedAt: new Date().toISOString(),
    };
    const updated = await db.updateDocument(
      DB,
      USERS,
      req.user.userId,
      payload
    );
    res.json(toPublicUser(updated));
  } catch (e) {
    next(e);
  }
};

// POST /api/register
export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, address, ...profile } =
      req.body;

    const dup = await db.listDocuments(DB, USERS, [
      Query.equal("email", email),
    ]);
    if (dup.total)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    const now = new Date().toISOString();
    const hash = await bcrypt.hash(password, 10);

    const userDoc = await db.createDocument(DB, USERS, ID.unique(), {
      iymraId: newIymraId(), // your own short ID
      email,
      passwordHash: hash,
      firstName,
      lastName,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      ...profile,
      ...flattenAddress(address), // nested from client
      ...flattenAddress(req.body), // or already-flat
    });

    // verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.createDocument(DB, VERIFY_COL, ID.unique(), {
      userId: userDoc.$id,
      token,
      expires: expires.toISOString(),
      createdAt: now,
    });

    await sendVerificationEmail(
      email,
      firstName,
      `${env.CLIENT_URL}/verify-email?token=${token}`
    );

    res
      .status(201)
      .json({ message: "Registration successful. Please verify your email." });
  } catch (e) {
    next(e);
  }
};

// POST /api/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const list = await db.listDocuments(DB, USERS, [
      Query.equal("email", email),
    ]);
    if (list.total === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = list.documents[0];
    if (!user.emailVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ message: "Invalid email or password" });

    const accessToken = jwt.sign({ userId: user.$id, email }, env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.createDocument(DB, REFRESH_COL, ID.unique(), {
      userId: user.$id,
      token: refreshToken,
      expires: expires.toISOString(),
      createdAt: new Date().toISOString(),
    });

    res.json({
      accessToken,
      refreshToken,
      user: toPublicUser(user),
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/token/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token is required" });

    const list = await db.listDocuments(DB, REFRESH_COL, [
      Query.equal("token", refreshToken),
    ]);
    if (list.total === 0)
      return res.status(401).json({ message: "Invalid refresh token" });

    const stored = list.documents[0];
    if (new Date(stored.expires) < new Date()) {
      await db.deleteDocument(DB, REFRESH_COL, stored.$id);
      return res.status(401).json({ message: "Refresh token has expired" });
    }

    const user = await db.getDocument(DB, USERS, stored.userId);
    const accessToken = jwt.sign(
      { userId: user.$id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  } catch (e) {
    next(e);
  }
};

// POST /api/logout
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const list = await db.listDocuments(DB, REFRESH_COL, [
        Query.equal("token", refreshToken),
      ]);
      if (list.total)
        await db.deleteDocument(DB, REFRESH_COL, list.documents[0].$id);
    }
    res.json({ message: "Logged out successfully" });
  } catch (e) {
    next(e);
  }
};

// middleware
export const requireAuth = (req, _res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return next({ status: 401, message: "Authentication required" });

  const token = auth.split(" ")[1];
  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch (e) {
    next({
      status: 401,
      message:
        e.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};


/* ------------------------------------------------------------------ */
/*  POST /api/password/change/request                                  */
/* ------------------------------------------------------------------ */
export const requestPasswordChange = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword)
      return res.status(400).json({ message: 'Current password required' });

    const user = await db.getDocument(DB, USERS, req.user.userId);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok)
      return res.status(401).json({ message: 'Current password is wrong' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expires = new Date(Date.now() + 15 * 60 * 1000);               // 15 min

    await db.createDocument(DB, PW_CHANGE_COL, ID.unique(), {
      userId: user.$id,
      code,
      expires: expires.toISOString(),
      createdAt: new Date().toISOString(),
    });

    await sendPasswordChangeCode(user.email, user.firstName, code);
    res.json({ message: 'Verification code sent to your email' });
  } catch (e) {
    next(e);
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/password/change/confirm                                  */
/* ------------------------------------------------------------------ */
export const confirmPasswordChange = async (req, res, next) => {
  try {
    const { code, newPassword } = req.body;

    // basic server-side strength check
    const strong =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!strong.test(newPassword))
      return res
        .status(400)
        .json({ message: 'New password is not strong enough' });

    // find the token
    const list = await db.listDocuments(DB, PW_CHANGE_COL, [
      Query.equal('userId', req.user.userId),
      Query.equal('code', code),
    ]);
    if (list.total === 0)
      return res.status(400).json({ message: 'Invalid or expired code' });

    const tok = list.documents[0];
    if (new Date(tok.expires) < new Date()) {
      await db.deleteDocument(DB, PW_CHANGE_COL, tok.$id);
      return res.status(400).json({ message: 'Code has expired' });
    }

    // update password
    const hash = await bcrypt.hash(newPassword, 10);
    await db.updateDocument(DB, USERS, req.user.userId, {
      passwordHash: hash,
      updatedAt: new Date().toISOString(),
    });

    // burn the token
    await db.deleteDocument(DB, PW_CHANGE_COL, tok.$id);
    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    next(e);
  }
};