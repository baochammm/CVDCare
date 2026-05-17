import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getNearbyHospitals } from "../controllers/hospital.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/nearby", getNearbyHospitals);

export default router;
