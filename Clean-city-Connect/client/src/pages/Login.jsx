import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import WaveButton from '../components/ui/WaveButton';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuth, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '' });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${form.phone.replace(/\s/g, '')}`, password: form.password }),
      });
      const data = await response.json();

      if (response.ok) {
        setAuth(data.user, data.token);
        toast.success('Welcome back! 🌿');
        if (data.user.role === 'officer') {
          navigate('/officer-dashboard');
        } else if (data.user.role === 'citizen') {
          navigate('/dashboard');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      console.log(user)
      if (user.role === 'officer') {
        navigate('/officer-dashboard');
      } else if (user.role === 'citizen') {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="auth-page">
      {/* Left – Illustration */}
      <div className="auth-illustration auth-illustration--login">
        <div className="auth-illustration-content">
          <img
            src="/assets/eco-city-bg.png"
            alt="Clean green city"
            className="auth-illustration-img"
          />
          <h2 className="auth-illustration-title">
            Welcome Back! 🌿
          </h2>
          <p className="auth-illustration-desc">
            "Be the change. Keep your city clean."
          </p>
        </div>

        {/* Decorative elements */}
        <div className="auth-bg-circle-1" />
        <div className="auth-bg-circle-2" />
        <div className="auth-bg-svg">
          <svg width="80" height="120" viewBox="0 0 60 80" fill="none">
            <path d="M30 0 C50 20 55 50 30 80 C5 50 10 20 30 0Z" fill="#22c55e" />
          </svg>
        </div>
      </div>

      {/* Right – Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* Mobile tagline */}
          <div className="auth-mobile-tagline">
            <span className="auth-mobile-tagline-icon">🌿</span>
            <p className="auth-mobile-tagline-text">Be the change. Keep your city clean.</p>
          </div>

          <h1 className="auth-form-title">
            Welcome Back
          </h1>
          <p className="auth-form-subtitle">
            Sign in to continue reporting and tracking complaints
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Phone Number"
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
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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

            <div className="auth-form-link-container">
              <Link
                to="/forgot-password"
                className="auth-form-link"
              >
                Forgot Password?
              </Link>
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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </WaveButton>
            </div>
          </form>

          <p className="auth-form-footer">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-form-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
