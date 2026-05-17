import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateAndSendOtp, verifyOtpCode } from '../services/twilio.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cleancity-super-secret-key';

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ─── SEND OTP (used by signup phone verification & forgot password) ───
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    await generateAndSendOtp(phone);
    
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// ─── VERIFY OTP (just verifies, does not create user) ───
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const isValid = verifyOtpCode(phone, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// ─── SIGNUP (name, phone, password — after OTP was verified on frontend) ───
export const signup = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this phone number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, phone, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, passwordHash, 'citizen']
    );
    const user = result.rows[0];

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        reward_points: user.reward_points,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// ─── LOGIN (phone + password) ───
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'No account found with this phone number' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ message: 'Please use OTP login or reset your password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        reward_points: user.reward_points,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// ─── RESET PASSWORD (after OTP verified) ───
export const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: 'Phone, OTP, and new password are required' });
    }

    const isValid = verifyOtpCode(phone, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE phone = $2 RETURNING id',
      [passwordHash, phone]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// ─── OFFICER LOGIN (phone + password, officers seeded in DB) ───
export const officerLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    const result = await query('SELECT * FROM users WHERE phone = $1 AND role = $2', [phone, 'officer']);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    // If officer has a password, verify it
    if (user.password_hash && password) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Officer login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Officer Login Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};
