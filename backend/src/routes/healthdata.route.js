import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMyHistory,
  getLatestPrediction,
  deleteHealthData,
  updateHealthData,
} from "../controllers/healthdata.controller.js";

const router = express.Router();
router.use(protectRoute);

router.get("/my-history", getMyHistory);
router.get("/latest", getLatestPrediction);
router.delete("/:id", deleteHealthData);
router.put("/:id", updateHealthData);

export default router;
