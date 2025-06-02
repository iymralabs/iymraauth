import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send verification email
export const sendVerificationEmail = async (email, firstName, verificationUrl) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Iymra Accounts" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin-bottom: 10px;">Verify Your Email</h1>
        </div>
        
        <p>Hello ${firstName},</p>
        
        <p>Thank you for registering with Iymra Accounts! To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        
        <p>This link will expire in 24 hours. If you didn't create an account with us, you can safely ignore this email.</p>
        
        <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Iymra Labs. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  
  
  return transporter.sendMail(mailOptions);
};

// only the extra helper; keep the old transporter
export const sendPasswordChangeCode = async (email, firstName, code) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Iymra Accounts" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password change verification code',
    html: `
      <p>Hello ${firstName},</p>
      <p>We received a request to change the password on your Iymra account.</p>
      <p>Your verification code is:</p>
      <h2 style="letter-spacing:2px">${code}</h2>
      <p>This code will expire in 15 minutes. If you didn’t request a change, you can safely ignore this message.</p>
    `,
  });
};
