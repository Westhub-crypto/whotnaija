import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      localStorage.setItem('whotnaija_admin_token', data.token);
      localStorage.setItem('whotnaija_admin_info', JSON.stringify(data.admin));
      toast.success('Welcome, Admin');
      navigate('/masteradmin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" style={{ background: '#020208' }}>
      <div className="hero-bg-effects">
        <div className="hero-orb" style={{ width: 400, height: 400, background: '#6C2BD9', top: -100, right: -100, opacity: 0.1 }} />
      </div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="auth-card" style={{ borderColor: 'rgba(108,43,217,0.3)' }}>
        <div className="auth-logo">
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #6C2BD9, #1A1A35)' }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
            WhotNaija <span style={{ color: '#9B6DFF' }}>Admin</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Restricted access — Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Admin Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                className="input"
                placeholder="admin@whotnaija.com"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
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
          <button type="submit" className="btn btn-full btn-lg" style={{ background: 'linear-gradient(135deg, #6C2BD9, #E84393)', color: '#fff' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Access Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
