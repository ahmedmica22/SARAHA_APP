import jwt from "jsonwebtoken";
import {
  USER_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
  ADMIN_TOKEN_SECRET_KEY,
  ADMIN_REFRESH_TOKEN_SECRET_KEY,
} from "../../../../config/config.service.js";
export const generateToken = async ({
  payload = {},
  secret = USER_TOKEN_SECRET_KEY,
  options = {},
} = {}) => {
  const opts = { ...(options || {}) };

  if (!opts.expiresIn) {
    // choose default expiry based on which secret is used
    if (secret === USER_TOKEN_SECRET_KEY) {
      opts.expiresIn =
        process.env.USER_TOKEN_EXPIRES_IN ||
        process.env.USER_TOKEN_EXPIRES ||
        "15m";
    } else if (secret === ADMIN_TOKEN_SECRET_KEY) {
      opts.expiresIn =
        process.env.ADMIN_TOKEN_EXPIRES_IN ||
        process.env.ADMIN_TOKEN_EXPIRES ||
        "15m";
    } else if (secret === USER_REFRESH_TOKEN_SECRET_KEY) {
      opts.expiresIn =
        process.env.USER_REFRESH_TOKEN_EXPIRES_IN ||
        process.env.USER_REFRESH_TOKEN_EXPIRES ||
        "7d";
    } else if (secret === ADMIN_REFRESH_TOKEN_SECRET_KEY) {
      opts.expiresIn =
        process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN ||
        process.env.ADMIN_REFRESH_TOKEN_EXPIRES ||
        "30d";
    }
  }

  return jwt.sign(payload, secret, Object.keys(opts).length ? opts : undefined);
};

export const getTokenSignature = async (role) => {
  let AccessSignature = undefined;
  let refreshSignature = undefined;
  // support multiple role shapes (string, numeric, enum name)
  const r = typeof role === "string" ? role.toLowerCase() : role;
  const isAdmin =
    r === "roleenum.admin" ||
    r === "admin" ||
    r === 0 ||
    r === "0" ||
    (typeof r === "string" && r.includes("admin"));

  if (isAdmin) {
    AccessSignature = ADMIN_TOKEN_SECRET_KEY;
    refreshSignature = ADMIN_REFRESH_TOKEN_SECRET_KEY;
  } else {
    AccessSignature = USER_TOKEN_SECRET_KEY;
    refreshSignature = USER_REFRESH_TOKEN_SECRET_KEY;
  }
  return { AccessSignature, refreshSignature };
  // return {signature,refreshSignature};
};
export const generateAccessToken = (payload = {}, expiresIn = "15m") => {
  return jwt.sign(payload, USER_TOKEN_SECRET_KEY, { expiresIn });
};

export const generateRefreshToken = (payload = {}, expiresIn = "7d") => {
  return jwt.sign(payload, USER_REFRESH_TOKEN_SECRET_KEY, { expiresIn });
};

export const verifyAccessToken = (token) =>
  jwt.verify(token, USER_TOKEN_SECRET_KEY);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, USER_REFRESH_TOKEN_SECRET_KEY);
