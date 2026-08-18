import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create a transporter
const getTransporter = async () => {
  // If mock transporter is specified, we create a test account on Ethereal or log details
  if (env.EMAIL_USER === 'mock_user' || !env.EMAIL_USER || env.EMAIL_PASS === 'mock_pass' || !env.EMAIL_PASS) {
    // Return a console logger fallback or generate an Ethereal SMTP transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      // Fallback if network fails
      return null;
    }
  }

  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  console.log(`✉️ [EMAIL VERIFICATION] Sending to: ${email}`);
  console.log(`🔗 Verification Link: ${verificationLink}`);

  const transporter = await getTransporter();
  if (!transporter) {
    console.log('📝 (SMTP server offline/mocked. Email printed to console instead.)');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d0e12; color: #f3f4f6; border-radius: 8px; border: 1px solid #1f2937;">
      <h2 style="color: #a855f7;">Welcome to AI Mentor, ${name}!</h2>
      <p>Thank you for signing up for the Personalized Career & Learning Operating System.</p>
      <p>Please click the button below to verify your email address and get started:</p>
      <a href="${verificationLink}" style="display: inline-block; background-color: #a855f7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; margin-bottom: 15px;">Verify Email</a>
      <p>If you did not request this, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #1f2937; margin-top: 20px; margin-bottom: 20px;" />
      <p style="font-size: 12px; color: #9ca3af;">AI Mentor Inc. - Your Personalized Career & Learning Co-Pilot</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Verify your AI Mentor Account',
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Email Preview: ${previewUrl}`);
    }
  } catch (error) {
    console.error(`❌ Failed to send verification email: ${(error as Error).message}`);
  }
};

export const sendResetPasswordEmail = async (email: string, name: string, token: string): Promise<void> => {
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  console.log(`✉️ [PASSWORD RESET] Sending to: ${email}`);
  console.log(`🔗 Reset Link: ${resetLink}`);

  const transporter = await getTransporter();
  if (!transporter) {
    console.log('📝 (SMTP server offline/mocked. Email printed to console instead.)');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d0e12; color: #f3f4f6; border-radius: 8px; border: 1px solid #1f2937;">
      <h2 style="color: #3b82f6;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your AI Mentor account.</p>
      <p>Please click the button below to reset your password. This link is valid for 1 hour:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; margin-bottom: 15px;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <hr style="border: 0; border-top: 1px solid #1f2937; margin-top: 20px; margin-bottom: 20px;" />
      <p style="font-size: 12px; color: #9ca3af;">AI Mentor Inc. - Your Personalized Career & Learning Co-Pilot</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Reset your AI Mentor Password',
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Email Preview: ${previewUrl}`);
    }
  } catch (error) {
    console.error(`❌ Failed to send reset email: ${(error as Error).message}`);
  }
};
