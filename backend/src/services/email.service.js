import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'h',
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendWelcomeEmail(to, data) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: 'Welcome to Our Platform!',
            html: `
                <h1>Welcome, ${data.name}!</h1>
                <p>Thank you for registering with us. Your account has been created successfully.</p>
                <p>Start exploring our platform and enjoy your shopping experience!</p>
                <br>
                <p>Best regards,<br>The Platform Team</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendPasswordResetEmail(to, data) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You requested to reset your password. Click the link below to proceed:</p>
                <a href="${data.resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p>This link will expire at: ${data.expiresAt}</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>The Platform Team</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendPasswordResetConfirmation(to) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: 'Password Changed Successfully',
            html: `
                <h1>Password Changed</h1>
                <p>Your password has been changed successfully.</p>
                <p>If you didn't make this change, please contact our support team immediately.</p>
                <br>
                <p>Best regards,<br>The Platform Team</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendPasswordChangeNotification(to) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: 'Password Changed',
            html: `
                <h1>Password Change Notification</h1>
                <p>Your password was recently changed.</p>
                <p>If this wasn't you, please secure your account immediately.</p>
                <br>
                <p>Best regards,<br>The Platform Team</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }
}

export default new EmailService();