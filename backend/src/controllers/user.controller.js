import User from "../models/User.js";
import HealthData from "../models/healthData.js";

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const { displayName, city } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (displayName !== undefined) user.displayName = displayName;
    if (city !== undefined) user.city = city;

    await user.save();

    const updated = await User.findById(req.user._id).select("-password");
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// PUT /api/user/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide both current and new password" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password" });
  }
};

// DELETE /api/user/account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Please provide your password to confirm" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await HealthData.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.clearCookie("jwt");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account" });
  }
};
