import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.delete("/account", deleteAccount);

export default router;
