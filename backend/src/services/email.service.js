import { MailtrapClient } from "mailtrap";

class EmailService {
  constructor() {
    this.client = new MailtrapClient({
      token: process.env.MAILTRAP_TOKEN || '4459452083a6de11bf916ecd12abeebb',
    });

    this.sender = {
      email: process.env.MAILTRAP_SENDER_EMAIL || "hello@demomailtrap.co",
      name: process.env.MAILTRAP_SENDER_NAME || "Techaven",
    };
  }

  /**
   * Send email using Mailtrap
   * @param {Object} options - Email options
   * @param {string|Array} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content (optional)
   * @param {string} options.category - Email category (optional)
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail(options) {
    let { to = "born2code265@gmail.com", subject, text, html, category = "General" } = options;

    if (!to || !subject || (!text && !html)) {
      to = 'born2code265@gmail.com';
      subject = 'Test Email from TechHaven';
        text = 'This is a test email sent from the TechHaven email service.';
        html = '<p>This is a test email sent from the TechHaven email service.</p>';
    }

    const recipients = Array.isArray(to) 
      ? to.map(email => ({ email }))
      : [{ email: to }];

    const emailData = {
      from: this.sender,
      to: recipients,
      subject,
      text,
      html,
      category,
    };

    try {
      const result = await this.client.send(emailData);
      console.log('Email sent successfully:', {
        to,
        subject,
        messageId: result.message_ids
      });
      
      return {
        success: true,
        messageId: result.message_ids,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error('Failed to send email:', {
        error: error.message,
        to,
        subject,
      });
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, data) {
    const text = `Welcome ${data.name}!\n\nThank you for joining TechHaven. We're excited to have you on board.\nYou can now start shopping, selling, or managing your account.\n\nBest regards,\nTechHaven Team`;

    const html = `
      <h2>Welcome ${data.name}!</h2>
      <p>Thank you for joining TechHaven. We're excited to have you on board.</p>
      <p>You can now start shopping, selling, or managing your account.</p>
      <br/>
      <p>Best regards,<br/><strong>TechHaven Team</strong></p>
    `;

    return this.sendEmail({
      to,
      subject: "Welcome to TechHaven!",
      text,
      html,
      category: "Welcome Email",
    });
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(to = 'born2code265@gmail.com', otp, expiresIn = 10) {
    const text = `Verify Your Email\n\nYour One-Time Password (OTP) is: ${otp}\nThis code will expire in ${expiresIn} minutes.\n\nDo not share this code with anyone.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTechHaven Team`;

    const html = `
      <h2>Verify Your Email</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h3 style="color: #007bff; font-size: 24px; letter-spacing: 5px;">${otp}</h3>
      <p>This code will expire in ${expiresIn} minutes.</p>
      <p><strong>Do not share this code with anyone.</strong></p>
      <br/>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br/><strong>TechHaven Team</strong></p>
    `;

    return this.sendEmail({
      to,
      subject: "Your TechHaven OTP Code",
      text,
      html,
      category: "OTP Email",
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, data) {
    const text = `Password Reset Request\n\nWe received a request to reset your password. Use the link below to proceed:\n\n${data.resetLink}\n\nThis link will expire in ${data.expiresAt}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTechHaven Team`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p><a href="${data.resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>This link will expire in ${data.expiresAt}</p>
      <p><strong>If you didn't request this, please ignore this email.</strong></p>
      <br/>
      <p>Best regards,<br/><strong>TechHaven Team</strong></p>
    `;

    return this.sendEmail({
      to,
      subject: "Reset Your TechHaven Password",
      text,
      html,
      category: "Password Reset",
    });
  }

  /**
   * Send password change notification
   */
  async sendPasswordChangeNotification(to) {
    const text = `Password Changed\n\nYour password has been successfully changed.\n\nIf you didn't make this change, please contact our support team immediately.\n\nBest regards,\nTechHaven Team`;

    const html = `
      <h2>Password Changed</h2>
      <p>Your password has been successfully changed.</p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <br/>
      <p>Best regards,<br/><strong>TechHaven Team</strong></p>
    `;

    return this.sendEmail({
      to,
      subject: "Your TechHaven Password Has Been Changed",
      text,
      html,
      category: "Security Notification",
    });
  }

  /**
   * Send password reset confirmation
   */
  async sendPasswordResetConfirmation(to) {
    const text = `Password Reset Successful\n\nYour password has been successfully reset.\n\nYou can now log in with your new password.\n\nBest regards,\nTechHaven Team`;

    const html = `
      <h2>Password Reset Successful</h2>
      <p>Your password has been successfully reset.</p>
      <p>You can now log in with your new password.</p>
      <br/>
      <p>Best regards,<br/><strong>TechHaven Team</strong></p>
    `;

    return this.sendEmail({
      to,
      subject: "Your TechHaven Password Has Been Reset",
      text,
      html,
      category: "Password Reset Confirmation",
    });
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(to, subject, text, html = null) {
    return this.sendEmail({
      to,
      subject,
      text,
      html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
      category: "Custom Email",
    });
  }
}

export default new EmailService();