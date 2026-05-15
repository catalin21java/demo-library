import * as authService from "../services/authService.js";

export async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body);
    if (result.pendingApproval) {
      res.status(201).json({
        message: "Your admin account is pending approval.",
        user: result.user,
      });
      return;
    }
    res.status(201).json({
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
