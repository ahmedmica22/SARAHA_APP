import { createOne, findOne, UserModel } from "../../DB/index.js";
import {
  compareHash,
  generateHash,
} from "./../../common/utilities/security/hash.security.js";

import {
  decrypt,
  encrypt,
} from "./../../common/utilities/security/encryption.security.js";
import {
  generateToken,
  getTokenSignature,
} from "../../common/utilities/security/token.security.js";
import jwt from "jsonwebtoken";
import {
  USER_REFRESH_TOKEN_SECRET_KEY,
  ADMIN_REFRESH_TOKEN_SECRET_KEY,
  USER_TOKEN_SECRET_KEY,
  ADMIN_TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";

export const signup = async (inputs) => {
  const { userName, email, password, phone } = inputs;
  const checkUserExist = await findOne({
    model: UserModel,
    filter: { email },
    options: {
      // populate:[{path:'email'}],
      // lean:true
    },
  });
  console.log(checkUserExist);

  if (checkUserExist) {
    throw new Error("User already exist");
  }

  const user = await createOne({
    model: UserModel,
    data: [
      {
        userName,
        email,
        phone: await encrypt(phone),
        password: await generateHash(password),
      },
    ],
  });
  return user;
};
export const login = async (inputs) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email },
    // select :'-password'
  });
  if (!user) {
    throw new Error("invalid login credentials");
  }

  const match = await compareHash(password, user.password);
  if (!match) {
    throw new Error("invalid login credentials");
  }

  // const access_token = jwt.sign({ sub: user._id }, process.env.TOKEN_SECRET_KEY, {
  //   issuer: "localhost",
  //   expiresIn: "1d",
  //   audience: ["web", "mmobile"],
  // });

  const { AccessSignature, refreshSignature } = await getTokenSignature(
    user.role,
  );

  const access_token = await generateToken({
    payload: { sub: user._id },
    secret: AccessSignature,
    options: {
      issuer: "localhost",
      expiresIn: "1d",
      audience: ["web", "mobile"],
    },
  });

  const refreshToken = await generateToken({
    payload: { sub: user._id },
    secret: refreshSignature,
  });

  // sanitize user before returning
  const safeUser = { ...(user.toObject ? user.toObject() : user) };
  delete safeUser.password;
  safeUser.phone = safeUser.phone
    ? await decrypt(safeUser.phone)
    : safeUser.phone;

  return { refreshToken, access_token, user: safeUser };
};

export const refreshTokens = async ({ refreshToken } = {}) => {
  if (!refreshToken) throw new Error("refresh token missing");

  let payload = null;
  let accessSecret = null;
  let refreshSecret = null;

  try {
    payload = jwt.verify(refreshToken, USER_REFRESH_TOKEN_SECRET_KEY);
    accessSecret = USER_TOKEN_SECRET_KEY;
    refreshSecret = USER_REFRESH_TOKEN_SECRET_KEY;
  } catch (err) {
    try {
      payload = jwt.verify(refreshToken, ADMIN_REFRESH_TOKEN_SECRET_KEY);
      accessSecret = ADMIN_TOKEN_SECRET_KEY;
      refreshSecret = ADMIN_REFRESH_TOKEN_SECRET_KEY;
    } catch (err2) {
      throw new Error("Invalid refresh token");
    }
  }

  const sub = payload.sub;

  const access_token = await generateToken({
    payload: { sub },
    secret: accessSecret,
    options: { issuer: "localhost", expiresIn: process.env.USER_TOKEN_EXPIRES_IN || "15m" },
  });

  const newRefreshToken = await generateToken({ payload: { sub }, secret: refreshSecret });

  return { access_token, refreshToken: newRefreshToken };
};
