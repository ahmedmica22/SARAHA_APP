import { findById, UserModel } from "../../DB/index.js";

export const profile = async (id) => {
  const user = await findById({
    model: UserModel,
    id,
  });
  return user;
};
