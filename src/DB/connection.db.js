import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import { UserModel } from "./model/user.model.js";

export const authenticateDB = async () => {
  try {
    const result = await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 20000,
    });
    // console.log(result);
    await UserModel.syncIndexes()
    console.log("DB connection succefully ✅");
  } catch (error) {
    console.log("DB connection error ❌", `${error.message}`);
  }
};
