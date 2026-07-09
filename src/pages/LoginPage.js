// LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import logo from '../assets/logo.png';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      return toast.error('Please fill in all fields');
    }
    setLoading(true);
    const result = await login(form.identifier, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back! 🃏');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-container"
    >
      <div className="hero-bg-effects">
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.08 }} />
        <div className="hero-orb hero-orb-2" style={{ opacity: 0.08 }} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="auth-card"
      >
        <div className="auth-logo">
          <img src={logo} alt="WhotNaija" className="logo-icon" style={{ objectFit: 'cover' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>
            Whot<span style={{ color: 'var(--brand-gold)' }}>Naija</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Welcome back! Ready to play?
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email or Username</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                type="text"
                className="input"
                placeholder="Enter email or username"
                value={form.identifier}
                onChange={(e) => setForm(p => ({ ...p, identifier: e.target.value }))}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button type="button" className="input-eye" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--brand-gold)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Login to Play'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--brand-gold)', textDecoration: 'none', fontWeight: 600 }}>
            Register Free
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default LoginPage;
