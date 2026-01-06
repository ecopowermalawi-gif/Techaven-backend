import twilio from 'twilio';

class SMSService {
  constructor() {
    // Initialize Twilio client
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN 
    );

    // Twilio Verify Service SID
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    // Sender phone number (Twilio phone number  +18146802757)
    this.senderNumber = '+18146802757';
  }

  /**
   * Send SMS using Twilio
   * @param {Object} options - SMS options
   * @param {string|Array} options.to - Recipient phone number(s)
   * @param {string} options.body - SMS message body
   * @returns {Promise<Object>} - Send result
   */
  async sendSMS(options) {
    let { to = process.env.DEFAULT_PHONE_NUMBER, body } = options;

    if (!to || !body) {
      to = process.env.DEFAULT_PHONE_NUMBER || '+265888001347';
      body = 'This is a test SMS sent from the TechHaven SMS service.';
    }

    try {
      const result = await this.client.messages.create({
        body,
        from: this.senderNumber,
        to: this.formatPhoneNumber(to)
      });

      console.log('SMS sent successfully:', {
        to,
        body,
        messageId: result.sid,
        status: result.status
      });
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        message: "SMS sent successfully",
      };
    } catch (error) {
      console.error('Failed to send SMS:', {
        error: error.message,
        to,
        body,
      });
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  /**
   * Send OTP verification via SMS
   * @param {string} phoneNumber - Recipient phone number
   * @returns {Promise<Object>} - Verification result
   */
  async sendOTP(phoneNumber) {
    try {
      const verification = await this.client.verify.v2.services(this.verifyServiceSid)
        .verifications
        .create({
          to: this.formatPhoneNumber(phoneNumber),
          channel: 'sms'
        });

      console.log('OTP sent successfully:', {
        to: '+265888001347',
        verificationSid: verification.sid,
        status: verification.status
      });

      return {
        success: true,
        verificationSid: verification.sid,
        status: verification.status,
        message: "OTP sent successfully",
      };
    } catch (error) {
      console.error('Failed to send OTP:', {
        error: error.message,
        to: '+265888001347',
      });
      throw new Error(`OTP sending failed: ${error.message}`);
    }
  }

  /**
   * Verify OTP code
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} code - OTP code to verify
   * @returns {Promise<Object>} - Verification check result
   */
  async verifyOTP(phoneNumber, code) {
    try {
      const verificationCheck = await this.client.verify.v2.services(this.verifyServiceSid)
        .verificationChecks
        .create({
          to: this.formatPhoneNumber(phoneNumber),
          code: code
        });

      console.log('OTP verification result:', {
        to: '+265888001347',
        verificationSid: verificationCheck.sid,
        status: verificationCheck.status,
        valid: verificationCheck.valid
      });

      return {
        success: verificationCheck.status === 'approved',
        valid: verificationCheck.valid,
        status: verificationCheck.status,
        verificationSid: verificationCheck.sid,
        message: verificationCheck.status === 'approved' 
          ? "OTP verified successfully" 
          : "Invalid OTP code"
      };
    } catch (error) {
      console.error('Failed to verify OTP:', {
        error: error.message,
        to: '+265888001347',
      });
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

  /**
   * Send welcome SMS
   */
  async sendWelcomeSMS(phoneNumber, data) {
    const body = `Welcome ${data.name}!\n\nThank you for joining TechHaven. We're excited to have you on board.\nYou can now start shopping, selling, or managing your account.\n\nBest regards,\nTechHaven Team`;

    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Send OTP notification SMS
   */
  async sendOTPSMS(phoneNumber, otp, expiresIn = 10) {
    const body = `TechHaven Verification Code: ${otp}\n\nThis code will expire in ${expiresIn} minutes.\n\nDo not share this code with anyone.\n\nIf you didn't request this, please ignore this message.`;

    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Send password reset notification
   */
  async sendPasswordResetNotification(phoneNumber, data) {
    const body = `Password Reset Request\n\nWe received a request to reset your password. Use this link to proceed:\n${data.resetLink}\n\nThis link will expire in ${data.expiresAt}\n\nIf you didn't request this, please contact support.`;

    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Send password change notification
   */
  async sendPasswordChangeNotification(phoneNumber) {
    const body = `Security Alert: Your TechHaven password has been changed.\n\nIf you didn't make this change, please contact our support team immediately.`;

    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Send password reset confirmation
   */
  async sendPasswordResetConfirmation(phoneNumber) {
    const body = `Password Reset Successful\n\nYour password has been successfully reset.\n\nYou can now log in with your new password.`;

    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmation(phoneNumber, orderData) {
    const body = `Order Confirmed!\n\nOrder #${orderData.orderId}\nTotal: $${orderData.total}\nExpected Delivery: ${orderData.deliveryDate}\n\nTrack your order in your account.\n\nThank you for shopping with TechHaven!`;

    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Send shipping update SMS
   */
  async sendShippingUpdate(phoneNumber, shippingData) {
    const body = `Shipping Update\n\nOrder #${shippingData.orderId}\nStatus: ${shippingData.status}\nTracking: ${shippingData.trackingUrl || 'N/A'}\n\n${shippingData.additionalInfo || ''}`;

    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Send custom SMS
   */
  async sendCustomSMS(phoneNumber, body) {
    return this.sendSMS({
      to: '+265888001347',
      body,
    });
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it doesn't start with +, add +
    if (!phoneNumber.startsWith('+')) {
      // Assuming US/Canada numbers for default, adjust as needed
      return `+1${cleaned}`;
    }
    
    return phoneNumber;
  }

  /**
   * Check if a phone number is valid
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic validation - adjust based on your requirements
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}

export default new SMSService();