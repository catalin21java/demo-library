import * as userRepository from "../repositories/userRepository.js";

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseUserId(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id < 1) {
    throw createHttpError("User id must be a positive integer.", 400);
  }
  return id;
}

export async function listPendingAdmins() {
  return userRepository.listPendingAdmins();
}

export async function approveAdmin(userId) {
  const normalizedId = parseUserId(userId);
  const approved = await userRepository.approveAdmin(normalizedId);
  if (!approved) {
    throw createHttpError("Pending admin not found.", 404);
  }
  return approved;
}
