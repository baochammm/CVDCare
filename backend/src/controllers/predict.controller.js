import axios from "axios";
import HealthData from "../models/healthData.js";

export const predictHealth = async (req, res) => {
  try {
    const userId = req.user._id;
    const inputData = req.body;

    // Call ML backend
    const mlResponse = await axios.post(
      `${process.env.ML_BACKEND_URL}/predict`,
      inputData,
    );

    const { prediction, risk_score, risk_level, top_factors, recommendations } =
      mlResponse.data;

    // Save to MongoDB
    const history = await HealthData.create({
      user: userId,
      ...inputData,
      prediction,
      risk_score,
      risk_level,
      top_factors,
      recommendations: recommendations ?? [],
    });

    // Return result to frontend
    res.status(200).json({
      success: true,
      predictionResult: {
        prediction,
        risk_score,
        risk_level,
        top_factors,
        recommendations: recommendations ?? [],
      },
    });
  } catch (error) {
    console.error("Prediction error:", error.message);
    res.status(500).json({
      success: false,
      message: "Prediction failed. Please try again.",
    });
  }
};
