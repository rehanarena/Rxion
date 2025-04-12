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

// In your mailer file (mailer.ts)
export const sendAppointmentBookedEmail = async (
  email: string,
  patientName: string,
  slotDate: string,
  slotTime: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Appointment Confirmation",
    text: `Hello ${patientName}, your appointment is booked on ${slotDate} at ${slotTime}.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Appointment Confirmation</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your appointment is successfully booked on <strong>${slotDate}</strong> at <strong>${slotTime}</strong>.</p>
        <p>Thank you for choosing Rxion.</p>
        <p>Best regards,<br>Rxion Team</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(" Email sent: %s", info.messageId);
};
