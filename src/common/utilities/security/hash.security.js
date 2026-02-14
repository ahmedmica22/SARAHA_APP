import { hash, compare } from "bcrypt";
import { SALT_ROUND } from "../../../../config/config.service.js";
import { HashEnum } from "../../enums/security.enum.js";
export const generateHash = async (plainText, salt = SALT_ROUND , algo = HashEnum.Bcrypt) => {
  let hashResult = ' '
  switch (algo) {
    case HashEnum.Bcrypt:
    hashResult = await hash(plainText, salt);
    break;
    case HashEnum.Argon:
    hashResult = await argon2.hash(plainText, salt);
    break;
  }
  return hashResult
};

export const compareHash = async (plainText, cipherText , algo = HashEnum.Bcrypt) => {
  let match = false
  switch (algo){
    case HashEnum.Bcrypt:
    match = await compare(plainText, cipherText);
    break;
    case HashEnum.Argon:
    match = await argon2.verify(cipherText, plainText);
    break;
    default:
    match = await compare (plainText , cipherText)
    break;
  }
  return match
};
