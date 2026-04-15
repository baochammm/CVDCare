import User from "../models/User.js";
import HealthData from "../models/healthData.js";

// Environment variable for ML API URL
const ML_API_URL = process.env.ML_BACKEND_URL || "http://localhost:8000";

// GET /api/admin/users (get all users)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "_id userName displayName email role city createdAt",
    );

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

// PATCH /api/admin/health-data/:id/restore
export const restoreHealthData = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await HealthData.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Health data not found" });
    }

    if (!record.isDeleted) {
      return res.status(400).json({ message: "Record is not deleted" });
    }

    record.isDeleted = false;
    await record.save();

    res.status(200).json({ message: "Record restored successfully" });
  } catch (error) {
    console.log("Admin restoreHealthData error:", error.message);
    res.status(500).json({ message: "Failed to restore health data" });
  }
};
