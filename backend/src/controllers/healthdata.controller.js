import HealthData from "../models/healthData.js";

// Save prediction history
export const saveHistory = async (req, res) => {
  try {
    const userId = req.user._id; // from protectRoute middleware

    const {
      age,
      gender,
      height,
      weight,
      ap_hi,
      ap_lo,
      cholesterol,
      gluc,
      smoke,
      alco,
      active,
      prediction,
      risk_score,
      risk_level,
      top_factors,
      recommendations,
    } = req.body;

    const history = await HealthData.create({
      user: userId,
      age,
      gender,
      height,
      weight,
      ap_hi,
      ap_lo,
      cholesterol,
      gluc,
      smoke,
      alco,
      active,
      prediction,
      risk_score,
      risk_level,
      top_factors,
      recommendations,
    });

    return res.status(201).json(history);
  } catch (err) {
    console.error("Error saving history:", err);
    res.status(500).json({ error: "Failed to save history" });
  }
};

// Get history for logged-in user
export const getHistory = async (req, res) => {
  try {
    const histories = await HealthData.find({ user: req.user._id }).sort({
      createdAt: 1,
    });

    res.json(histories);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
};
