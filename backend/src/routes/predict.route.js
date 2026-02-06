import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { predictHealth } from "../controllers/predict.controller.js";

const router = express.Router();
router.use(protectRoute);
router.post("/", predictHealth);

export default router;
