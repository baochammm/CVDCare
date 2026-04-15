import express from "express";
import {
  getAllUsers,
  deleteUser,
  getUserHealthData,
  restoreHealthData,
} from "../controllers/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// admin only
router.use(protectRoute, requireAdmin);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/users/:id/health-data", getUserHealthData);
router.patch("/health-data/:id/restore", restoreHealthData);

export default router;
