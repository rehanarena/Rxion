import nodemailer from 'nodemailer';

const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

const sendEmail = async ({
  to,
  subject,
  text,
  html = '',
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendOTP = async (email: string): Promise<void> => {
  const otp = generateOTP(); 

  await sendEmail({
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  });

 
};


