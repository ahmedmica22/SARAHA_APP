import nodemailer from "nodemailer";
import { createOne, findOne, updateOne } from "../../DB/database.service.js";
import { OtpModel } from "../../DB/model/otp.model.js";
import { UserModel, findOne as findUser } from "../../DB/index.js";

let transporter;
if (process.env.GMAIL_USER) {
  // prefer Gmail configuration; support OAuth2 if client id/secret/refresh token provided
  if (
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  ) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  } else {
    // fallback to plain SMTP with app password
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
} else {
  // generic SMTP transport (legacy)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: (process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const generateCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export const sendOtpToEmail = async ({ email } = {}) => {
  if (!email) throw new Error("email is required");

  // ensure user exists (or you may choose to allow sending to arbitrary emails)
  const user = await findUser({ model: UserModel, filter: { email } });
  if (!user) throw new Error("User not found");

  const code = generateCode(6);
  const expiresAt = new Date(
    Date.now() + parseInt(process.env.OTP_EXPIRES_MINUTES || "10") * 60 * 1000,
  );

  await createOne({ model: OtpModel, data: [{ email, code, expiresAt }] });

  //for production
  const backendUrl =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const verifyLink = `${backendUrl.replace(/\/$/, "")}/auth/verify-otp?email=${encodeURIComponent(
    email,
  )}&code=${encodeURIComponent(code)}`;

  const mailOptions = {
    from:
      process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is: ${code}. Visit ${verifyLink} to verify. It will expire in ${process.env.OTP_EXPIRES_MINUTES || "10"} minutes.`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>
           <p>Click the link below to verify your email (or paste the code into the app):</p>
           <p><a href="${verifyLink}">Verify email</a></p>
           <p>This code expires in ${process.env.OTP_EXPIRES_MINUTES || "10"} minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);

  return { ok: true };
};

export const verifyOtpForEmail = async ({ email, code } = {}) => {
  if (!email || !code) throw new Error("email and code are required");

  const record = await findOne({
    model: OtpModel,
    filter: { email, code, used: false },
  });
  if (!record) throw new Error("Invalid or used code");

  if (new Date(record.expiresAt) < new Date()) {
    throw new Error("Code expired");
  }

  // mark used
  await updateOne({
    model: OtpModel,
    filter: { _id: record._id },
    update: { used: true },
  });

  // mark user email as confirmed
  await updateOne({
    model: UserModel,
    filter: { email },
    update: { confirmEmail: "verified" },
  });

  return { ok: true };
};
