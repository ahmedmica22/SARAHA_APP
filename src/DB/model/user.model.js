import mongoose from "mongoose";
import { GenderEnum, ProviderEnum } from "../../common/enums/user.enum.js";
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
      minLength: [2, "first name must be at least 2 characters"],
      maxLength: [30, "first name must be at most 30 characters"],
    },
    lastName: {
      type: String,
      required: [true, "last name is required"],
      minLength: [2, "last name must be at least 2 characters"],
      maxLength: [30, "last name must be at most 30 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    DOB: {
      type: Date,
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    phone: {
      type: String,
    },
    confirmEmail: {
      type: String,
    },
  },
  {
    collection: "users",
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  },
);

userSchema
  .virtual("userName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({
      firstName,
      lastName,
    });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

export const UserModel =
  mongoose.models.User || mongoose.model("user", userSchema);
