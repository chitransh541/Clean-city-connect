import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import WaveButton from '../components/ui/WaveButton';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Signup() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${form.phone.replace(/\s/g, '')}`;
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success('OTP sent to your phone! 📱');
        setStep('otp');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${form.phone.replace(/\s/g, '')}`;

      // Step 1: Verify OTP
      const verifyRes = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        toast.error(verifyData.message || 'Invalid OTP');
        return;
      }

      // Step 2: Create account with password
      const signupRes = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: fullPhone, password: form.password }),
      });
      const signupData = await signupRes.json();

      if (signupRes.ok) {
        setAuth(signupData.user, signupData.token);
        toast.success('Account created successfully! 🎉');
        navigate('/dashboard');
      } else {
        toast.error(signupData.message || 'Signup failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    try {
      const fullPhone = `+91${form.phone.replace(/\s/g, '')}`;
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      if (response.ok) {
        toast.success('OTP resent! 📱');
      } else {
        toast.error('Failed to resend OTP');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left – Illustration */}
      <div className="auth-illustration auth-illustration--signup">
        <div className="auth-illustration-content">
          <img
            src="/assets/eco-city-bg.png"
            alt="Clean green city with garbage collector"
            className="auth-illustration-img"
          />
          <h2 className="auth-illustration-title">
            Join the Movement 🌍
          </h2>
          <p className="auth-illustration-desc">
            "Be the change. Keep your city clean."
          </p>
        </div>

        {/* Decorative */}
        <div className="auth-bg-circle-1" />
        <div className="auth-bg-circle-2" />
      </div>

      {/* Right – Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* Mobile tagline */}
          <div className="auth-mobile-tagline">
            <span className="auth-mobile-tagline-icon">🌍</span>
            <p className="auth-mobile-tagline-text">Be the change. Keep your city clean.</p>
          </div>

          {step === 'form' ? (
            <>
              <h1 className="auth-form-title">
                Create Account
              </h1>
              <p className="auth-form-subtitle">
                Join thousands of citizens making cities cleaner
              </p>

              <form onSubmit={handleSendOtp} className="auth-form">
                <Input
                  label="Full Name *"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={<FiUser />}
                />

                <Input
                  label="Phone Number *"
                  name="phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  icon={<FiPhone />}
                  prefix="+91"
                />

                <div className="auth-password-wrapper">
                  <Input
                    label="Password *"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    icon={<FiLock />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="auth-btn-wrapper">
                  <WaveButton
                    type="submit"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="auth-btn-content">
                        <Spinner size={20} />
                        Sending OTP...
                      </span>
                    ) : (
                      'Sign Up'
                    )}
                  </WaveButton>
                </div>
              </form>

              <p className="auth-form-footer">
                Already have an account?{' '}
                <Link to="/login" className="auth-form-link">
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            /* OTP Verification Step */
            <>
              <div className="otp-header">
                <span className="otp-icon">📱</span>
                <h1 className="otp-title">
                  Verify Phone
                </h1>
                <p className="otp-subtitle">
                  We sent a 6-digit code to <strong className="otp-subtitle-phone">+91 {form.phone}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="input-field otp-input"
                    autoFocus
                  />
                </div>

                <div className="auth-btn-wrapper">
                  <WaveButton
                    type="submit"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="auth-btn-content">
                        <Spinner size={20} />
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </WaveButton>
                </div>

                <p className="otp-footer">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="auth-form-link"
                  >
                    Resend OTP
                  </button>
                </p>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="otp-back-btn"
                >
                  ← Back to form
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
