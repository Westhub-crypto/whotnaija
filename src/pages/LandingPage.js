import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Trophy, Users, Star, ArrowRight, Play } from 'lucide-react';
import logo from '../assets/logo.png';

const FEATURES = [
  { icon: <Zap size={22} />, title: 'Real-Time Multiplayer', desc: 'Play live 1v1 or 4v4 games with players across Nigeria. Get matched in seconds.' },
  { icon: <Shield size={22} />, title: 'Secure & Fair', desc: 'Military-grade security with anti-cheat systems ensure every game is fair and your money is safe.' },
  { icon: <Trophy size={22} />, title: 'Big Cash Prizes', desc: 'Win up to ₦72,000 per game. Stakes from ₦500 to ₦20,000 per player.' },
  { icon: <Users size={22} />, title: 'Smart Matchmaking', desc: 'Get matched instantly with real players across Nigeria. Games start fast, around the clock.' },
];

const ROOMS = [
  { stake: '₦500', prize: '₦900', type: '1v1', color: 'rgba(108,43,217,0.2)', accent: '#9B6DFF' },
  { stake: '₦2,000', prize: '₦3,600', type: '1v1', color: 'rgba(245,166,35,0.15)', accent: '#F5A623' },
  { stake: '₦5,000', prize: '₦18,000', type: '4v4', color: 'rgba(232,67,147,0.2)', accent: '#E84393' },
  { stake: '₦20,000', prize: '₦72,000', type: '4v4', color: 'rgba(0,208,132,0.15)', accent: '#00D084' },
];

const SUITS = ['⭕', '⭐', '➕', '🔺', '⬛'];

export default function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="hero-bg-effects">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', position: 'relative', zIndex: 10,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="WhotNaija" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
            Whot<span style={{ color: 'var(--brand-gold)' }}>Naija</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Play Now</Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', padding: '60px 24px',
          position: 'relative', zIndex: 1,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
            borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: 24,
          }}
        >
          <Star size={14} style={{ color: 'var(--brand-gold)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-gold)' }}>
            Nigeria's #1 Online Whot Card Game
          </span>
        </motion.div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 8vw, 80px)',
          fontWeight: 800, lineHeight: 1.05, marginBottom: 24, maxWidth: 800,
        }}>
          Play Whot.<br />
          <span className="text-gradient">Win Real Cash.</span>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540, marginBottom: 40, lineHeight: 1.7 }}>
          The authentic Nigerian Whot experience — stake real money, play against opponents
          across Nigeria, and walk away with big winnings. Your ₦500 welcome bonus is waiting.
        </p>

        {/* Floating cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SUITS.map((suit, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, -8, 0], opacity: 1 }}
              transition={{ delay: i * 0.1, y: { repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut' } }}
              style={{
                width: 56, height: 76, background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 4, fontSize: 20,
              }}
            >
              {suit}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{i * 3 + 2}</span>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            <Play size={18} /> Start Playing Free
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Login to Account
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40, marginTop: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '50,000+', label: 'Players' },
            { value: '₦500', label: 'Welcome Bonus' },
            { value: '₦72,000', label: 'Max Prize' },
            { value: '24/7', label: 'Live Games' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }} className="text-gradient">
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Room Cards */}
      <section style={{ padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textAlign: 'center', marginBottom: 8 }}>
          Choose Your <span className="text-gradient">Battle Room</span>
        </h2>
        <p className="text-secondary" style={{ textAlign: 'center', marginBottom: 40 }}>
          Multiple stakes. Maximum thrill. Platform takes only 10%.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 960, margin: '0 auto' }}>
          {ROOMS.map((room, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: room.color, border: `1px solid ${room.accent}30`,
                borderRadius: 'var(--radius-lg)', padding: 24,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: room.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {room.type}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {room.type === '1v1' ? '2 players' : '4 players'}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: room.accent }}>
                {room.stake}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Win up to <strong style={{ color: '#fff' }}>{room.prize}</strong>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textAlign: 'center', marginBottom: 40 }}>
          Why <span className="text-gradient">WhotNaija</span>?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div style={{
                width: 44, height: 44, background: 'rgba(245,166,35,0.1)',
                borderRadius: 10, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--brand-gold)', marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 40px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'var(--grad-brand)', borderRadius: 'var(--radius-xl)',
          padding: '60px 40px', maxWidth: 700, margin: '0 auto', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Ready to Play? 🃏
          </h2>
          <p style={{ fontSize: 16, marginBottom: 32, opacity: 0.9, color: '#fff' }}>
            Register now and get ₦500 welcome bonus instantly.
            No hidden fees. Withdraw anytime.
          </p>
          <Link to="/register" className="btn" style={{
            background: '#fff', color: '#0C0C1E', fontWeight: 700, padding: '14px 36px',
            borderRadius: 'var(--radius-md)', fontSize: 16, display: 'inline-flex', gap: 8,
          }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)', padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Whot<span style={{ color: 'var(--brand-gold)' }}>Naija</span>
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2024 WhotNaija. 18+ only. Play responsibly.
        </span>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Support</a>
        </div>
      </footer>
    </div>
  );
}
