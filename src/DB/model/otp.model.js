import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  {
    collection: "otps",
    timestamps: true,
  },
);

export const OtpModel = mongoose.models.Otp || mongoose.model("otp", otpSchema);
