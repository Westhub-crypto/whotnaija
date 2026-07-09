import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Save, Trophy, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from './DashboardPage';
import { useAuthStore } from '../store';
import { formatDate, formatNaira } from '../utils/socket';
import api from '../utils/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ firstName: '', lastName: '', middleName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        middleName: user.middleName || '',
        phone: user.phone || '',
      });
    }
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setTransactions(data.transactions || []);
    } catch {}
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (pwForm.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    setPwSaving(true);
    try {
      await api.post('/users/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setPwSaving(false);
  };

  const stats = user?.gameStats || {};
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Profile" />

        <div style={{ padding: 24 }}>
          {/* Profile header */}
          <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{user?.firstName} {user?.lastName}</h2>
              <p className="text-muted text-sm">@{user?.username} • {user?.state}, Nigeria</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className={`badge ${user?.isVerified ? 'badge-green' : 'badge-gold'}`}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className="badge badge-purple">Level {stats.level || 1}</span>
              </div>
            </div>
          </div>

          {/* Game stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Games', value: stats.totalGames || 0, icon: <TrendingUp size={18} /> },
              { label: 'Wins', value: stats.wins || 0, icon: <Trophy size={18} /> },
              { label: 'Win Rate', value: `${winRate}%`, icon: '📊' },
              { label: 'Win Streak', value: stats.winStreak || 0, icon: '🔥' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: 18 }}>
                <div style={{ marginBottom: 8, color: 'var(--brand-gold)' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { key: 'profile', label: 'Profile Details' },
              { key: 'security', label: 'Security' },
              { key: 'transactions', label: 'Transactions' },
            ].map(tab => (
              <button key={tab.key} className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ maxWidth: 520 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <div className="input-group">
                  <label className="input-label">First Name</label>
                  <input className="input" value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Last Name</label>
                  <input className="input" value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Middle Name</label>
                <input className="input" value={form.middleName} onChange={(e) => setForm(p => ({ ...p, middleName: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Email (cannot be changed)</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={16} />
                  <input className="input" value={user?.email} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone className="input-icon" size={16} />
                  <input className="input" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon" size={16} />
                  <input className="input" value={`${user?.lga}, ${user?.state}, Nigeria`} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
              </button>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ maxWidth: 480 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
              <div className="input-group">
                <label className="input-label">Current Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={16} />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    className="input"
                    style={{ paddingRight: 44 }}
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  />
                  <button type="button" className="input-eye" onClick={() => setShowCurrentPw(v => !v)}>
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={16} />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    className="input"
                    style={{ paddingRight: 44 }}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  />
                  <button type="button" className="input-eye" onClick={() => setShowNewPw(v => !v)}>
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  className="input"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                />
              </div>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={pwSaving}>
                {pwSaving ? <span className="spinner" /> : 'Update Password'}
              </button>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p className="text-muted text-sm">No transactions yet</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr key={i}>
                        <td>{tx.type}</td>
                        <td>{formatNaira(tx.amount)}</td>
                        <td><span className={`badge ${tx.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{tx.status}</span></td>
                        <td>{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
