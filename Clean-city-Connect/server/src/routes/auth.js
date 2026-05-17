import express from 'express';
import { sendOtp, verifyOtp, signup, login, resetPassword, officerLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/officer-login', officerLogin);

export default router;
