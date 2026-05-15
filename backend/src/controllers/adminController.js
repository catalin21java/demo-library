import * as adminService from "../services/adminService.js";

export async function getPendingAdmins(req, res, next) {
  try {
    const pendingAdmins = await adminService.listPendingAdmins();
    res.json(pendingAdmins);
  } catch (error) {
    next(error);
  }
}

export async function approvePendingAdmin(req, res, next) {
  try {
    const approved = await adminService.approveAdmin(req.params.id);
    res.json(approved);
  } catch (error) {
    next(error);
  }
}
