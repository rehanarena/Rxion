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

export  const sendAppointmentCompletedEmail = async (email: string, patientName: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Thank You for Choosing Rxion Team',
    text: `Hello ${patientName},

Thank you for choosing the Rxion team for your consultation. We appreciate your trust in us and look forward to assisting you in the future.

Best regards,
Rxion Team`,
  };

  await transporter.sendMail(mailOptions);
};


export  const sendAppointmentCancelledEmail = async (email: string, patientName: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Appointment Cancellation Notice',
    text: `Hello ${patientName},

We regret to inform you that your appointment has been canceled due to unforeseen circumstances on the doctor's end. We sincerely apologize for the inconvenience. Please feel free to reschedule at your convenience.

Best regards,
Rxion Team`,
  };

  await transporter.sendMail(mailOptions);
};