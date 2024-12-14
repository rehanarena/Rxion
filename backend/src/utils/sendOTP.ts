import nodemailer from 'nodemailer';

// Function to generate a random OTP
const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// Function to send OTP via email
export const sendOTP = async (email: string): Promise<void> => {
  // Generate OTP
  const otp = generateOTP();

  // Create a transporter for Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  // Set up the email options
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: email, 
    subject: 'Your OTP Code', 
    text: `Your OTP code is: ${otp}`, // Pass the generated OTP
  };

  // Send email with OTP
  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to', email);
    // Store OTP in a database or session for validation if needed
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};
