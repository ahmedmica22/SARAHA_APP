import { verifyAccessToken } from "../common/utilities/security/token.security.js";

export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    if (!authHeader) throw new Error("Invalid token");

    const token = String(authHeader).startsWith("Bearer")
      ? String(authHeader).split(" ")[1]
      : authHeader;

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    err.cause = { status: 401 };
    next(err);
  }
};
