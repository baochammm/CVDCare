import HealthData from "../models/healthData.js";

// Get history for logged-in user
export const getMyHistory = async (req, res) => {
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
