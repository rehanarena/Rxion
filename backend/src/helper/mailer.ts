import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'OTP for User Verification',
    text: `Your OTP for account verification is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordEmail = async (email: string, password: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Doctor Account Password',
    text: `Your account has been successfully created. Your password is: ${password}`,
  };

  await transporter.sendMail(mailOptions);
};

