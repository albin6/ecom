import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from './logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: false, // true for 465, false for 587
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(to, token) {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;
    const mailOptions = {
      from: `"Hannvis" <${env.EMAIL_FROM}>`,
      to,
      subject: 'Verify your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center;">Welcome to Hannvis</h2>
          <p style="color: #334155; font-size: 16px;">
            Thank you for registering! Please click the button below to verify your email address. This link expires in 30 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            If you did not create an account, no further action is required.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
          </p>
        </div>
      `,
    };

    try {
      if (!env.EMAIL_HOST || !env.EMAIL_USER) {
        logger.warn(`Email not configured. Verification URL: ${verificationUrl}`);
        return;
      }
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Message sent: ${info.messageId}`);
    } catch (error) {
      logger.error('Error sending email: ', error);
      throw new Error('Email could not be sent');
    }
  }
}

export const emailService = new EmailService();
