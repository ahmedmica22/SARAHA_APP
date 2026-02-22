import { Router } from "express";
import { login, signup, refreshTokens } from "./auth.service.js";
import { sendOtpToEmail, verifyOtpForEmail } from "./otp.service.js";
const router = Router();
router.post("/signup", async (req, res, next) => {
  const result = await signup(req.body);
  return res.status(201).json({ message: "Done signup", result });
});
router.post("/login", async (req, res, next) => {
  const result = await login(req.body);
  return res.status(201).json({ message: "Done login", result });
});
router.post("/refresh", async (req, res, next) => {
  const result = await refreshTokens(req.body);
  return res.status(200).json({ message: "Tokens refreshed", result });
});
router.post("/send-otp", async (req, res, next) => {
  const result = await sendOtpToEmail(req.body);
  return res.status(200).json({ message: "OTP sent", result });
});

router.post("/verify-otp", async (req, res, next) => {
  const result = await verifyOtpForEmail(req.body);
  return res.status(200).json({ message: "OTP verified", result });
});

export default router;
