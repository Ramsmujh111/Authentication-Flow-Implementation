import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email service configuration
 */
let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  // Configure transporter for Gmail or any SMTP service
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // false for TLS (587), true for SSL (465)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@authflow.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
): Promise<boolean> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0f766e; margin: 0; }
          .content { background-color: white; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #0f766e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .button:hover { background-color: #0d5c58; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>Welcome to AuthFlow! Thank you for signing up. To complete your registration and verify your email address, please click the button below:</p>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            
            <div class="warning">
              <strong>Note:</strong> This link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br>The AuthFlow Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 AuthFlow. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Email Verification
      
      Hello ${name},
      
      Welcome to AuthFlow! To verify your email, visit this link:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      Best regards,
      The AuthFlow Team
    `;

    return sendEmail({
      to: email,
      subject: 'Email Verification - AuthFlow',
      html,
      text,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0f766e; margin: 0; }
          .content { background-color: white; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #0f766e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .button:hover { background-color: #0d5c58; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AuthFlow!</h1>
          </div>
          
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>Congratulations! Your email has been verified successfully. Your account is now fully activated.</p>
            
            <a href="${process.env.NEXT_PUBLIC_API_URL}/login" class="button">Login to Your Account</a>
            
            <p>You can now access all features of AuthFlow. If you have any questions or need assistance, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>The AuthFlow Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 AuthFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: 'Welcome to AuthFlow - Your Account is Verified',
      html,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0f766e; margin: 0; }
          .content { background-color: white; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #0f766e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .button:hover { background-color: #0d5c58; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background-color: #fee2e2; padding: 15px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #fca5a5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <a href="${resetUrl}" class="button">Reset Your Password</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 24 hours. If the link has expired, you can request a new password reset from the login page.
            </div>
            
            <p><strong>For your security:</strong></p>
            <ul>
              <li>Never share this link with anyone</li>
              <li>This link is only valid for the email address: <strong>${email}</strong></li>
              <li>We'll never ask you for your password via email</li>
            </ul>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br>The AuthFlow Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 AuthFlow. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      Hello ${name},
      
      We received a request to reset your password. To reset it, visit this link:
      ${resetUrl}
      
      This link will expire in 24 hours.
      
      If you didn't request this, you can safely ignore this email.
      
      Best regards,
      The AuthFlow Team
    `;

    return sendEmail({
      to: email,
      subject: 'Password Reset - AuthFlow',
      html,
      text,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send OTP email for login
 */
export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0f766e; margin: 0; }
          .content { background-color: white; padding: 30px; border-radius: 8px; }
          .otp-box { background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 2px solid #86efac; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #0f766e; letter-spacing: 5px; }
          .info { font-size: 12px; color: #666; margin-top: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background-color: #fef3c7; padding: 15px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #fcd34d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Login Code</h1>
          </div>
          
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>We received a request to log in to your AuthFlow account. Use the code below to complete your login:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="info">Valid for 10 minutes</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. We will never ask you for this code via email or phone.
            </div>
            
            <p><strong>Didn't request this code?</strong><br>
            If you didn't try to log in to your account, you can safely ignore this email. Your account is secure.</p>
            
            <p>Best regards,<br>The AuthFlow Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 AuthFlow. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Your Login Code
      
      Hello ${name},
      
      Use the code below to complete your login:
      
      ${otp}
      
      Valid for 10 minutes
      
      Security Notice: Never share this code with anyone.
      
      Best regards,
      The AuthFlow Team
    `;

    return sendEmail({
      to: email,
      subject: 'Your AuthFlow Login Code - Valid for 10 minutes',
      html,
      text,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}
