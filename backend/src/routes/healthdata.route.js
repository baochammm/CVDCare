import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  saveHistory,
  getHistory,
} from "../controllers/healthdata.controller.js";

const router = express.Router();
router.use(protectRoute);

router.post("/save", saveHistory);
router.get("/my-history", getHistory);

export default router;
