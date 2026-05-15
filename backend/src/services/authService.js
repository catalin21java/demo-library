import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { jwtExpiresIn, jwtSecret } from "../config/auth.js";
import * as userRepository from "../repositories/userRepository.js";

const VALID_ROLES = new Set(["user", "admin"]);

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeUsername(value) {
  const username = String(value || "").trim();
  if (username.length < 3) {
    throw createHttpError("Username must be at least 3 characters.", 400);
  }
  if (username.length > 32) {
    throw createHttpError("Username must be at most 32 characters.", 400);
  }
  return username;
}

function normalizePassword(value) {
  const password = String(value || "");
  if (password.length < 6) {
    throw createHttpError("Password must be at least 6 characters.", 400);
  }
  return password;
}

function normalizeSignupRole(value) {
  const role = String(value || "user").trim();
  if (!VALID_ROLES.has(role)) {
    throw createHttpError("Role must be user or admin.", 400);
  }
  return role;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export async function signup({ username, password, role }) {
  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = normalizePassword(password);
  const requestedRole = normalizeSignupRole(role);

  const existing = await userRepository.findByUsername(normalizedUsername);
  if (existing) {
    throw createHttpError("Username is already taken.", 409);
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, 10);
  const storedRole = requestedRole === "admin" ? "pending_admin" : "user";
  const user = await userRepository.createUser({
    username: normalizedUsername,
    passwordHash,
    role: storedRole,
  });

  if (storedRole === "pending_admin") {
    return {
      pendingApproval: true,
      user: toPublicUser(user),
    };
  }

  const token = signToken(user);
  return {
    pendingApproval: false,
    token,
    user: toPublicUser(user),
  };
}

export async function login({ username, password }) {
  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = normalizePassword(password);

  const user = await userRepository.findByUsername(normalizedUsername);
  if (!user) {
    throw createHttpError("Invalid username or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(normalizedPassword, user.passwordHash);
  if (!passwordMatches) {
    throw createHttpError("Invalid username or password.", 401);
  }

  if (user.role === "pending_admin") {
    throw createHttpError(
      "Your admin account is awaiting approval. Please try again later.",
      403,
    );
  }

  const publicUser = await userRepository.findById(user.id);
  const token = signToken(publicUser);

  return {
    token,
    user: toPublicUser(publicUser),
  };
}
