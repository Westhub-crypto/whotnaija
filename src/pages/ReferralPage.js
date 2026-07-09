import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Users, Gift, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from './DashboardPage';
import { formatNaira, formatDate } from '../utils/socket';
import api from '../utils/api';

export default function ReferralPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: res } = await api.get('/referrals/stats');
      setData(res);
    } catch {
      toast.error('Failed to load referral data');
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join WhotNaija',
          text: `Join me on WhotNaija and get ₦500 welcome bonus! Use my code: ${data?.referralCode}`,
          url: data?.referralLink,
        });
      } catch {}
    } else {
      handleCopy(data?.referralLink);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Referrals" />

        <div style={{ padding: 24 }}>
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--grad-purple)', borderRadius: 'var(--radius-xl)',
              padding: '32px', marginBottom: 24, position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
            <Gift size={32} style={{ marginBottom: 12 }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>
              Earn ₦50 Per Referral 🎉
            </h2>
            <p style={{ opacity: 0.9, fontSize: 14, maxWidth: 480, color: '#fff' }}>
              Share your referral code with friends. When they sign up and make their first deposit,
              you instantly earn ₦50 commission credited to your wallet.
            </p>
          </motion.div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <Users size={24} style={{ color: 'var(--brand-purple)', marginBottom: 8 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>{data?.totalReferrals || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Referrals</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <Gift size={24} style={{ color: 'var(--brand-gold)', marginBottom: 8 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--brand-gold)' }}>
                {formatNaira(data?.totalEarned || 0)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Earned</div>
            </div>
          </div>

          {/* Referral code */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Referral Code</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{
                flex: 1, minWidth: 200, background: 'var(--bg-card2)', border: '1px dashed var(--brand-gold)',
                borderRadius: 'var(--radius-md)', padding: '14px 20px', textAlign: 'center',
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: '0.1em',
              }}>
                {data?.referralCode || '...'}
              </div>
              <button className="btn btn-secondary" onClick={() => handleCopy(data?.referralCode)}>
                <Copy size={16} />
              </button>
            </div>

            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Referral Link</h4>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input className="input" value={data?.referralLink || ''} readOnly style={{ flex: 1, minWidth: 200 }} />
              <button className="btn btn-secondary" onClick={() => handleCopy(data?.referralLink)}>
                <Copy size={16} />
              </button>
              <button className="btn btn-primary" onClick={handleShare}>
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>How It Works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                { step: '1', title: 'Share your code', desc: 'Send your unique code or link to friends' },
                { step: '2', title: 'Friend signs up', desc: 'They register using your referral code' },
                { step: '3', title: 'Earn ₦50', desc: 'Get ₦50 when they make their first deposit' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'var(--grad-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                    fontWeight: 800, fontFamily: 'var(--font-display)',
                  }}>{s.step}</div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referral list */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Referrals</h3>
            {!data?.referrals?.length ? (
              <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '24px 0' }}>
                No referrals yet. Share your code to start earning!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.referrals.map((ref, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{ref.username || ref.firstName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Joined {formatDate(ref.createdAt)}</div>
                    </div>
                    {ref.wallet?.hasDeposited ? (
                      <span className="badge badge-green"><CheckCircle2 size={12} style={{ marginRight: 4 }} />Earned ₦50</span>
                    ) : (
                      <span className="badge badge-gray"><Clock size={12} style={{ marginRight: 4 }} />Pending Deposit</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
