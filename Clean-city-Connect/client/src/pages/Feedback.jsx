import React, { useState } from 'react';
import { FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';
import WaveButton from '../components/ui/WaveButton';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Feedback() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.message.trim()) errs.message = 'Message is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Thanks for your feedback! 🌿');
      setSubmitted(true);
    } catch {
      toast.error('Failed to send feedback');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        {/* Eco character + heading */}
        <div className="feedback-header">
          <div className="feedback-icon-wrapper">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <path d="M40 18C18 23 13 37 8.5 49.5L13 51.5L15.5 46C16.6 46.4 17.8 46.7 19 46.7C29 46.7 37 39 40 18Z" fill="#22c55e"/>
              <circle cx="24" cy="14" r="10" fill="#86efac"/>
              <circle cx="21.5" cy="12.5" r="2" fill="#166534"/>
              <circle cx="26.5" cy="12.5" r="2" fill="#166534"/>
              <path d="M21 17 Q24 20 27 17" stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M32 8 Q36 4 38 9 Q34 11 32 8Z" fill="#4ade80" opacity="0.7"/>
            </svg>
          </div>
          <h1 className="feedback-title">
            Share Your <span className="feedback-title-highlight">Feedback</span>
          </h1>
          <p className="feedback-subtitle">
            We'd love to hear from you! Help us improve CleanCity Connect.
          </p>
        </div>

        {submitted ? (
          <div className="glass-card feedback-success">
            <span className="feedback-success-icon">🎉</span>
            <h2 className="feedback-success-title">Thank You!</h2>
            <p className="feedback-success-text">Your feedback has been submitted successfully.</p>
            <WaveButton onClick={() => { setSubmitted(false); setForm({ email: '', phone: '', message: '' }); }}>
              Send Another
            </WaveButton>
          </div>
        ) : (
          <div className="glass-card feedback-form-card">
            <form onSubmit={handleSubmit} className="feedback-form">
              <Input
                label="Email (Optional)"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                icon={<FiMail />}
              />
              <Input
                label="Phone (Optional)"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                icon={<FiPhone />}
              />
              <div className="feedback-textarea-wrapper">
                <label className="feedback-label">Message *</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell us what you think..."
                  value={form.message}
                  onChange={handleChange}
                  className={`input-field feedback-textarea ${errors.message ? 'input-field--error' : ''}`}
                />
                {errors.message && <p className="feedback-error">{errors.message}</p>}
              </div>
              <div className="feedback-btn-wrapper">
                <WaveButton type="submit" size="lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Feedback'}
                </WaveButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
