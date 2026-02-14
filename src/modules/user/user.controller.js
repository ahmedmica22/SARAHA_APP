import { Router } from "express";
import { profile } from "./user.service.js";

const router = Router();

router.get("/:userId", async (req, res, next) => {
  const account = await profile(req.params.userId);
  return res.status(200).json({ message: "Done", account });
});
export default router;
