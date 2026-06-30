import mongoose from "mongoose";

const healthDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // input data
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    height: {
      type: Number, // cm
      required: true,
    },
    weight: {
      type: Number, // kg
      required: true,
    },
    ap_hi: {
      type: Number, // Systolic BP
      required: true,
    },
    ap_lo: {
      type: Number, // Diastolic BP
      required: true,
    },
    cholesterol: {
      type: Number,
      enum: [1, 2, 3], // 1: normal, 2: above normal, 3: well above normal
      required: true,
    },
    gluc: {
      type: Number,
      enum: [1, 2, 3], // 1: normal, 2: above normal, 3: well above normal
      required: true,
    },
    smoke: {
      type: Boolean,
      default: false,
      required: true,
    },
    alco: {
      type: Boolean,
      default: false,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    // result
    prediction: Number, // 0 = no disease, 1 = has disease
    risk_score: Number, // probability of having disease
    risk_level: String, // "low risk", "medium risk", "high risk"

    // top 3 SHAP factors
    top_factors: [
      {
        feature: String,
        value: Number,
      },
    ],

    recommendations: {
      type: [String], // optional
      default: [],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const HealthData = mongoose.model("HealthData", healthDataSchema);

export default HealthData;
