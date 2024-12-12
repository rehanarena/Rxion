import bcrypt from 'bcrypt';
import OTP from '../models/otpModel';
import nodemailer, { SentMessageInfo } from 'nodemailer';

interface User {
  _id: string;
  email: string;
}

const sendOtpEmail = async ({ _id, email }: User, res: any): Promise<boolean> => {
  const otp: string = `${Math.floor(100000 + Math.random() * 900000)}`;

  console.log("otp: ", otp);

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.BREVO_MAIL,
      pass: process.env.BREVO_KEY,
    },
  });

  const mailOptions = {
    from: process.env.BREVO_MAIL,
    to: email,
    subject: "For email verification from Ministore",
    html: `<p>Your OTP for verification is ${otp}. Don't share your OTP!<br>The OTP is only valid for 5 minutes.</p>`,
  };

  const hashedOtp: string = await bcrypt.hash(otp, 10);

  const existingOtpData = await OTP.findOne({ userId: _id });

  if (existingOtpData) {
    const deletedOldOtpData = await OTP.deleteOne({ userId: _id });

    // Handle deletion failure if necessary
    if (!deletedOldOtpData) {
      // You can send an error response here if needed
      console.log("Failed to delete the old OTP data.");
      return false;
    }
  }

  const otpdata = new OTP({
    userId: _id,
    otp: hashedOtp,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
  });

  await otpdata.save();

  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("Email has been sent", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export { sendOtpEmail };
