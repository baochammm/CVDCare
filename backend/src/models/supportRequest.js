import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ["processing", "processed"],
      default: "processing",
    },
  },
  { timestamps: true },
);

const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);

export default SupportRequest;
