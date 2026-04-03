import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMyHistory } from "../controllers/healthdata.controller.js";

const router = express.Router();
router.use(protectRoute);

router.get("/my-history", getMyHistory);

export default router;
