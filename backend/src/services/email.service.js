 import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

const TOKEN = process.env.MAILTRAP_TOKEN || 'b00a339040d45c422803176c1217f281';

class EmailService {
    constructor() {
        // Use Mailtrap for production, Ethereal for development
        if (process.env.NODE_ENV === 'production' && TOKEN) {
            this.transporter = nodemailer.createTransport(
                MailtrapTransport({
                    token: TOKEN
                })
            );
        } else {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: process.env.SMTP_PORT || 587,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        }
    }

    async sendWelcomeEmail(to, data) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@techaven.com',
            to: to,
            subject: 'Welcome to TechHaven!',
            html: `
                <h2>Welcome ${data.name}!</h2>
                <p>Thank you for joining TechHaven. We're excited to have you on board.</p>
                <p>You can now start shopping, selling, or managing your account.</p>
                <br/>
                <p>Best regards,<br/>TechHaven Team</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw new Error(`Failed to send welcome email: ${error.message}`);
        }
    }

    async sendOTPEmail(to, otp, expiresIn = 10) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@techaven.com',
            to: to,
            subject: 'Your TechHaven OTP Code',
            html: `
                <h2>Verify Your Email</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <h1 style="color: #007bff; letter-spacing: 2px;">${otp}</h1>
                <p>This code will expire in ${expiresIn} minutes.</p>
                <p><strong>Do not share this code with anyone.</strong></p>
                <br/>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br/>TechHaven Team</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('OTP email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw new Error(`Failed to send OTP email: ${error.message}`);
        }
    }

    async sendPasswordResetEmail(to, data) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@techaven.com',
            to: to,
            subject: 'Reset Your TechHaven Password',
            html: `
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Click the link below to proceed:</p>
                <p><a href="${data.resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
                <p>This link will expire in ${data.expiresAt}</p>
                <p><strong>If you didn't request this, please ignore this email.</strong></p>
                <br/>
                <p>Best regards,<br/>TechHaven Team</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error(`Failed to send password reset email: ${error.message}`);
        }
    }

    async sendPasswordChangeNotification(to) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@techaven.com',
            to: to,
            subject: 'Your TechHaven Password Has Been Changed',
            html: `
                <h2>Password Changed</h2>
                <p>Your password has been successfully changed.</p>
                <p>If you didn't make this change, please contact our support team immediately.</p>
                <br/>
                <p>Best regards,<br/>TechHaven Team</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password change notification sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending password change notification:', error);
            throw new Error(`Failed to send notification: ${error.message}`);
        }
    }

    async sendPasswordResetConfirmation(to) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@techaven.com',
            to: to,
            subject: 'Your TechHaven Password Has Been Reset',
            html: `
                <h2>Password Reset Successful</h2>
                <p>Your password has been successfully reset.</p>
                <p>You can now log in with your new password.</p>
                <br/>
                <p>Best regards,<br/>TechHaven Team</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset confirmation sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending password reset confirmation:', error);
            throw new Error(`Failed to send confirmation: ${error.message}`);
        }
    }
}

export default new EmailService();