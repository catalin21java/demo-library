import jwt from "jsonwebtoken";

import { jwtSecret } from "../config/auth.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      id: Number(payload.sub),
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return;
  }
  next();
}
