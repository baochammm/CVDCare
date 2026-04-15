import HealthData from "../models/healthData.js";

// Environment variable for ML API URL
const ML_API_URL = process.env.ML_BACKEND_URL || "http://localhost:8000";

// Get history for logged-in user
export const getMyHistory = async (req, res) => {
  try {
    const histories = await HealthData.find({
      user: req.user._id,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    res.json(histories);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
};

export const deleteHealthData = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await HealthData.findOne({ _id: id, user: req.user._id });

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    record.isDeleted = true;
    await record.save();

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error("Error deleting health data:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};

export const updateHealthData = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.user) {
      return res.status(400).json({ message: "Cannot update user field" });
    }

    const record = await HealthData.findOne({
      _id: id,
      user: req.user._id,
      isDeleted: false,
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Update fields
    Object.assign(record, req.body);
    await record.save();

    // Re-run prediction
    try {
      const mlPayload = {
        age: record.age,
        gender: record.gender,
        height: record.height,
        weight: record.weight,
        ap_hi: record.ap_hi,
        ap_lo: record.ap_lo,
        cholesterol: record.cholesterol,
        gluc: record.gluc,
        smoke: record.smoke ? "true" : "false",
        alco: record.alco ? "true" : "false",
        active: record.active ? "true" : "false",
      };

      const mlResponse = await fetch(`${ML_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload),
      });

      if (!mlResponse.ok) {
        throw new Error(`ML API error: ${await mlResponse.text()}`);
      }

      const mlData = await mlResponse.json();

      record.prediction = mlData.prediction;
      record.risk_score = mlData.risk_score;
      record.risk_level = mlData.risk_level;
      record.top_factors = mlData.top_factors;
      record.recommendations = mlData.recommendations || [];

      await record.save();

      res.status(200).json({
        message: "Health data updated and prediction recalculated successfully",
        healthData: record,
      });
    } catch (mlError) {
      res.status(200).json({
        message: "Health data updated but prediction recalculation failed",
        healthData: record,
        warning: mlError.message,
      });
    }
  } catch (err) {
    console.error("Error updating health data:", err);
    res.status(500).json({ error: "Failed to update record" });
  }
};
