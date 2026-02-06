import express from "express";
import {
  getAllUsers,
  deleteUser,
  getUserHealthData,
  deleteHealthData,
} from "../controllers/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// admin only
router.use(protectRoute, requireAdmin);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/users/:id/health-data", getUserHealthData);
router.delete("/health-data/:id", deleteHealthData);

export default router;
