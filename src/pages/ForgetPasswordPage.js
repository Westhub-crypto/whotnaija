import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import logo from '../assets/logo.png';

// ─────────────────────────────────────────────
// FORGOT PASSWORD  (3-step: email → question → new password)
// ─────────────────────────────────────────────
export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);   // 1=email, 2=answer question, 3=new password
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Step 1 — look up the user's security question by email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password/get-question', { email });
      setQuestion(data.question);
      setStep(2);
    } catch {
      // Still advance to step 2 even on failure (avoids email enumeration)
      setQuestion('What is the name of your first pet?');
      setStep(2);
    }
    setLoading(false);
  };

  // Step 2 — verify identity by answering the security question
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return toast.error('Please enter your answer');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password/verify-identity', { email, securityAnswer: answer });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email or security answer is incorrect');
    }
    setLoading(false);
  };

  // Step 3 — set new password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return toast.error('Password must contain uppercase, lowercase and a number');
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${resetToken}`, {
        password: newPassword,
        confirmPassword,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    }
    setLoading(false);
  };

  const STEP_LABELS = ['Enter Email', 'Security Question', 'New Password'];

  return (
    <div className="auth-container">
      <div className="hero-bg-effects">
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.08 }} />
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="auth-card">
        <div className="auth-logo">
          <img src={logo} alt="WhotNaija" className="logo-icon" style={{ objectFit: 'cover' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
            Reset Password
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {done ? 'Password updated!' : 'Verify your identity to reset your password'}
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--brand-green)', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Your password has been reset. Redirecting you to login…
            </p>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                    background: step >= s ? 'var(--grad-brand)' : 'var(--bg-card2)',
                    color: step >= s ? '#fff' : 'var(--text-muted)',
                    transition: 'var(--transition)', flexShrink: 0,
                  }}>{s}</div>
                  {s < 3 && (
                    <div style={{
                      flex: 1, height: 2,
                      background: step > s ? 'var(--brand-gold)' : 'var(--border-subtle)',
                      transition: 'var(--transition)',
                    }} />
                  )}
                </React.Fragment>
              ))}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4, whiteSpace: 'nowrap' }}>
                {STEP_LABELS[step - 1]}
              </span>
            </div>

            {/* Step 1 — Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                  Enter the email address linked to your WhotNaija account.
                </p>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={16} />
                    <input
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Continue →'}
                </button>
              </form>
            )}

            {/* Step 2 — Security question */}
            {step === 2 && (
              <form onSubmit={handleAnswerSubmit}>
                <div style={{
                  background: 'rgba(108,43,217,0.08)', border: '1px solid rgba(108,43,217,0.2)',
                  borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 20,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <ShieldCheck size={18} style={{ color: '#9B6DFF', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                    Answer the security question you set during registration.
                  </p>
                </div>

                <div className="input-group">
                  <label className="input-label">Your Security Question</label>
                  <div style={{
                    background: 'var(--bg-card2)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)', padding: '13px 16px',
                    fontSize: 14, color: 'var(--text-primary)',
                  }}>
                    {question}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Your Answer</label>
                  <div className="input-with-icon">
                    <ShieldCheck className="input-icon" size={16} />
                    <input
                      type={showAnswer ? 'text' : 'password'}
                      className="input"
                      placeholder="Type your answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                      autoComplete="off"
                    />
                    <button type="button" className="input-eye" onClick={() => setShowAnswer(v => !v)}>
                      {showAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Verify →'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 — New password */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                  Identity verified. Set your new password below.
                </p>

                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input"
                      placeholder="Min 8 chars, upper+lower+number"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                    />
                    <button type="button" className="input-eye" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Reset Password'}
                </button>
              </form>
            )}
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <Link to="/login" style={{ color: 'var(--brand-gold)', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RESET PASSWORD (direct token link — kept for compatibility)
// ─────────────────────────────────────────────
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, form);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed or link expired.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="auth-card">
        <div className="auth-logo">
          <img src={logo} alt="WhotNaija" className="logo-icon" style={{ objectFit: 'cover' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>New Password</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                className="input"
                style={{ paddingRight: 44 }}
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              />
              <button type="button" className="input-eye" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              className="input"
              value={form.confirmPassword}
              onChange={(e) => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VERIFY EMAIL (kept but auto-verifies on register now)
// ─────────────────────────────────────────────
export function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState('verifying');

  React.useEffect(() => {
    const verify = async () => {
      try {
        await api.post(`/auth/verify-email/${token}`);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch {
        setStatus('failed');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-container">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="auth-card" style={{ textAlign: 'center' }}>
        <img src={logo} alt="WhotNaija" className="logo-icon" style={{ margin: '0 auto 20px', objectFit: 'cover' }} />
        {status === 'verifying' && (
          <><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} /><p>Verifying…</p></>
        )}
        {status === 'success' && (
          <><CheckCircle2 size={48} style={{ color: 'var(--brand-green)', margin: '0 auto 16px', display: 'block' }} /><p>Verified! Redirecting…</p></>
        )}
        {status === 'failed' && (
          <><p style={{ color: 'var(--brand-red)', marginBottom: 16 }}>Link invalid or expired</p><Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link></>
        )}
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
