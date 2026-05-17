import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials not found. SMS sending will be mocked.');
}

// In a real app, use Redis. Using memory for simplicity in this prototype.
const otpStore = new Map();

export const sendSMS = async (to, body) => {
  if (!client) {
    console.log(`[MOCK SMS] To: ${to} | Body: ${body}`);
    return true;
  }
  
  try {
    await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
    throw error;
  }
};

export const generateAndSendOtp = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5 minute expiration
  otpStore.set(phone, {
    otp,
    expires: Date.now() + 5 * 60 * 1000
  });

  const message = `Your CleanCity Connect OTP is ${otp}. Valid for 5 minutes.`;
  await sendSMS(phone, message);
  
  return true;
};

export const verifyOtpCode = (phone, code) => {
  const record = otpStore.get(phone);
  
  if (!record) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(phone);
    return false;
  }
  
  if (record.otp === code) {
    otpStore.delete(phone);
    return true;
  }
  
  return false;
};
