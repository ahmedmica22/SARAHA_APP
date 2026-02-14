import { createOne, findOne, UserModel } from "../../DB/index.js";

import {
  compareHash,
  generateHash,
} from "./../../common/utilities/security/hash.security.js";
import {
  decrypt,
  encrypt,
} from "./../../common/utilities/security/encryption.security.js";

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
  user.phone = await decrypt(user.phone);
  return user;
};
