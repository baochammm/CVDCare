import User from "../models/User.js";
import HealthData from "../models/healthData.js";

// Environment variable for ML API URL
const ML_API_URL = process.env.ML_BACKEND_URL || "http://localhost:8000";

// GET /api/admin/users (get all users)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id userName email role createdAt");

    res.status(200).json({
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.log("Admin getAllUsers error:", error.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// DELETE /api/admin/users/:id (delete user by id)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting own account
    if (req.user.id === id) {
      return res
        .status(400)
        .json({ message: "Admin cannot delete own account" });
    }

    await HealthData.deleteMany({ user: id });
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Admin deleteUser error:", error.message);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// GET /api/admin/users/:id/health-data (get health data of a user)
export const getUserHealthData = async (req, res) => {
  try {
    const { id } = req.params;

    const healthDataList = await HealthData.find({ user: id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      totalPredictions: healthDataList.length,
      healthData: healthDataList,
    });
  } catch (error) {
    console.log("Admin getUserHealthData error:", error.message);
    res.status(500).json({ message: "Failed to fetch health data" });
  }
};

// DELETE /api/admin/health-data/:id (delete health data by id)
export const deleteHealthData = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await HealthData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Health data not found" });
    }

    res.status(200).json({ message: "Health data deleted successfully" });
  } catch (error) {
    console.log("Admin deleteHealthData error:", error.message);
    res.status(500).json({ message: "Failed to delete health data" });
  }
};

// PUT /api/admin/health-data/:id
export const updateHealthData = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent changing the associated user
    if (req.body.user) {
      return res.status(400).json({ message: "Cannot update user field" });
    }

    const updated = await HealthData.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Health data not found" });
    }

    try {
      const mlPayload = {
        age: updated.age,
        gender: updated.gender,
        height: updated.height,
        weight: updated.weight,
        ap_hi: updated.ap_hi,
        ap_lo: updated.ap_lo,
        cholesterol: updated.cholesterol,
        gluc: updated.gluc,
        smoke: updated.smoke ? "true" : "false",
        alco: updated.alco ? "true" : "false",
        active: updated.active ? "true" : "false",
      };
      const mlUrl = `${ML_API_URL}/predict`;
      const mlResponse = await fetch(mlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload),
      });

      if (!mlResponse.ok) {
        const errorText = await mlResponse.text();
        throw new Error(`ML API error: ${errorText}`);
      }

      const mlData = await mlResponse.json();

      // Update prediction result in database
      updated.prediction = mlData.prediction;
      updated.risk_score = mlData.risk_score;
      updated.risk_level = mlData.risk_level;
      updated.top_factors = mlData.top_factors;
      updated.recommendations = mlData.recommendations || [];

      await updated.save();

      console.log("Prediction recalculated and saved!");

      res.status(200).json({
        message: "Health data updated and prediction recalculated successfully",
        healthData: updated,
      });
    } catch (mlError) {
      // If ML call fails, still return the updated data without prediction
      res.status(200).json({
        message: "Health data updated but prediction recalculation failed",
        healthData: updated,
        warning: mlError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update health data",
      error: error.message,
    });
  }
};
