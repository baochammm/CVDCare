import express from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  deleteRequest,
} from "../controllers/support.controller.js";

const router = express.Router();

router.post("/", protectRoute, createRequest);
router.get("/my", protectRoute, getMyRequests);
router.get("/admin/all", protectRoute, requireAdmin, getAllRequests);
router.patch(
  "/admin/:id/status",
  protectRoute,
  requireAdmin,
  updateRequestStatus,
);
router.delete("/:id", protectRoute, deleteRequest);

export default router;
