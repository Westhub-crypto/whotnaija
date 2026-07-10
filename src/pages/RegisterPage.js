import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Hash, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { NIGERIAN_STATES, NIGERIAN_LGAS } from '../utils/socket';
import api from '../utils/api';
import logo from '../assets/logo.png';

// ─── InputField defined OUTSIDE the component ───────────────────────────────
// This is critical — if defined inside, React recreates the component on every
// keystroke, unmounts the input, and the user loses focus after each character.
const InputField = ({ label, field, type, icon: Icon, placeholder, optional, hint, value, onChange, error }) => (
  <div className="input-group" style={{ marginBottom: 16 }}>
    <label className="input-label">
      {label}{' '}
      {optional && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(Optional)</span>}
    </label>
    <div className="input-with-icon">
      {Icon && <Icon className="input-icon" size={16} />}
      <input
        type={type || 'text'}
        className={`input${error ? ' input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
      />
    </div>
    {error && <p className="error-text">{error}</p>}
    {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</p>}
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuthStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    username: '',
    email: '',
    phone: '',
    state: '',
    lga: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') || '',
    securityQuestion: '',
    securityAnswer: '',
    confirmSecurityAnswer: '',
  });

  const [questions, setQuestions] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  // Load security questions from backend
  useEffect(() => {
    api.get('/auth/security-questions')
      .then(res => setQuestions(res.data.questions || []))
      .catch(() => {});
  }, []);

  // Update LGA list whenever state changes
  useEffect(() => {
    if (form.state) {
      setLgas(NIGERIAN_LGAS[form.state] || []);
      setForm(prev => ({ ...prev, lga: '' }));
    } else {
      setLgas([]);
    }
  }, [form.state]);

  // Stable onChange handlers using useCallback
  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const togglePassword = useCallback(() => setShowPassword(v => !v), []);
  const toggleConfirm = useCallback(() => setShowConfirm(v => !v), []);
  const toggleAnswer = useCallback(() => setShowAnswer(v => !v), []);

  const validateStep1 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.username.trim() || form.username.length < 3) errs.username = 'Min 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Letters, numbers, underscores only';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone || !/^(\+234|0)[789][01]\d{8}$/.test(form.phone)) errs.phone = 'Valid Nigerian number required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.state) errs.state = 'State is required';
    if (!form.lga) errs.lga = 'LGA is required';
    if (form.password.length < 8) errs.password = 'Min 8 characters';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Must include uppercase, lowercase & number';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!form.securityQuestion) errs.securityQuestion = 'Please select a security question';
    if (!form.securityAnswer.trim() || form.securityAnswer.trim().length < 2) errs.securityAnswer = 'Answer must be at least 2 characters';
    if (form.securityAnswer.trim().toLowerCase() !== form.confirmSecurityAnswer.trim().toLowerCase()) {
      errs.confirmSecurityAnswer = 'Answers do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);

    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName || undefined,
      username: form.username,
      email: form.email,
      phone: form.phone,
      state: form.state,
      lga: form.lga,
      password: form.password,
      confirmPassword: form.confirmPassword,
      referralCode: form.referralCode || undefined,
      securityQuestion: form.securityQuestion,
      securityAnswer: form.securityAnswer.trim(),
    });

    setLoading(false);
    if (result.success) {
      toast.success('Account created! ₦500 bonus added 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  const STEP_LABELS = ['Personal Info', 'Location & Password', 'Security Question'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-container"
      style={{ alignItems: 'flex-start', paddingTop: 40 }}
    >
      <div className="hero-bg-effects">
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.07 }} />
        <div className="hero-orb hero-orb-2" style={{ opacity: 0.07 }} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="auth-card"
        style={{ maxWidth: 520 }}
      >
        <div className="auth-logo">
          <img src={logo} alt="WhotNaija" className="logo-icon" style={{ objectFit: 'cover' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>
            Join <span style={{ color: 'var(--brand-gold)' }}>WhotNaija</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Get ₦500 welcome bonus on registration
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
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

        {/* ── STEP 1: Personal info ── */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <InputField label="First Name" field="firstName" icon={User} placeholder="Emeka"
                value={form.firstName} onChange={handleChange('firstName')} error={errors.firstName} />
              <InputField label="Last Name" field="lastName" icon={User} placeholder="Okonkwo"
                value={form.lastName} onChange={handleChange('lastName')} error={errors.lastName} />
            </div>
            <InputField label="Middle Name" field="middleName" icon={User} placeholder="Chukwu"
              optional value={form.middleName} onChange={handleChange('middleName')} />
            <InputField label="Username" field="username" icon={Hash} placeholder="emeka99"
              hint="3–20 chars. Letters, numbers, underscores only"
              value={form.username} onChange={handleChange('username')} error={errors.username} />
            <InputField label="Email Address" field="email" type="email" icon={Mail} placeholder="emeka@gmail.com"
              value={form.email} onChange={handleChange('email')} error={errors.email} />
            <InputField label="Phone Number" field="phone" type="tel" icon={Phone} placeholder="08012345678"
              hint="Nigerian number (080, 081, 070, etc.)"
              value={form.phone} onChange={handleChange('phone')} error={errors.phone} />
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
              Continue →
            </button>
          </form>
        )}

        {/* ── STEP 2: Location + password ── */}
        {step === 2 && (
          <form onSubmit={handleNext}>
            {/* Country — locked */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Country</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={16} />
                <input className="input" value="Nigeria 🇳🇬" readOnly
                  style={{ opacity: 0.7, cursor: 'not-allowed', paddingLeft: 44 }} />
              </div>
            </div>

            {/* State */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">State</label>
                <select
                  className={`select${errors.state ? ' input-error' : ''}`}
                  value={form.state}
                  onChange={handleChange('state')}
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="error-text">{errors.state}</p>}
              </div>

              {/* LGA — populated from selected state */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">LGA</label>
                <select
                  className={`select${errors.lga ? ' input-error' : ''}`}
                  value={form.lga}
                  onChange={handleChange('lga')}
                  disabled={!form.state}
                >
                  <option value="">{form.state ? 'Select LGA' : 'Select state first'}</option>
                  {lgas.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.lga && <p className="error-text">{errors.lga}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input${errors.password ? ' input-error' : ''}`}
                  placeholder="Min 8 chars, upper+lower+number"
                  value={form.password}
                  onChange={handleChange('password')}
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button type="button" className="input-eye" onClick={togglePassword}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={`input${errors.confirmPassword ? ' input-error' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button type="button" className="input-eye" onClick={toggleConfirm}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>

            {/* Referral code */}
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">
                Referral Code <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(Optional)</span>
              </label>
              <div className="input-with-icon">
                <Hash className="input-icon" size={16} />
                <input type="text" className="input" placeholder="Enter referral code"
                  value={form.referralCode} onChange={handleChange('referralCode')}
                  autoComplete="off" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={handleBack}>← Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Continue →</button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Security question ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'rgba(108,43,217,0.08)', border: '1px solid rgba(108,43,217,0.2)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 20,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <ShieldCheck size={18} style={{ color: '#9B6DFF', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Your security question is used to verify your identity when you forget your password.
                Remember your answer — spelling must match (not case-sensitive).
              </p>
            </div>

            {/* Security question dropdown */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Security Question</label>
              <select
                className={`select${errors.securityQuestion ? ' input-error' : ''}`}
                value={form.securityQuestion}
                onChange={handleChange('securityQuestion')}
              >
                <option value="">Choose a security question</option>
                {questions.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              {errors.securityQuestion && <p className="error-text">{errors.securityQuestion}</p>}
            </div>

            {/* Answer */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Your Answer</label>
              <div className="input-with-icon">
                <ShieldCheck className="input-icon" size={16} />
                <input
                  type={showAnswer ? 'text' : 'password'}
                  className={`input${errors.securityAnswer ? ' input-error' : ''}`}
                  placeholder="Type your answer"
                  value={form.securityAnswer}
                  onChange={handleChange('securityAnswer')}
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                  autoComplete="off"
                />
                <button type="button" className="input-eye" onClick={toggleAnswer}>
                  {showAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.securityAnswer && <p className="error-text">{errors.securityAnswer}</p>}
            </div>

            {/* Confirm answer */}
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Confirm Your Answer</label>
              <div className="input-with-icon">
                <ShieldCheck className="input-icon" size={16} />
                <input
                  type={showAnswer ? 'text' : 'password'}
                  className={`input${errors.confirmSecurityAnswer ? ' input-error' : ''}`}
                  placeholder="Repeat your answer"
                  value={form.confirmSecurityAnswer}
                  onChange={handleChange('confirmSecurityAnswer')}
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                  autoComplete="off"
                />
              </div>
              {errors.confirmSecurityAnswer && <p className="error-text">{errors.confirmSecurityAnswer}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={handleBack}>← Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create Account 🃏'}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-gold)', textDecoration: 'none', fontWeight: 600 }}>
            Login
          </Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
          By registering, you agree to our Terms of Service. 18+ only.
        </p>
      </motion.div>
    </motion.div>
  );
}
