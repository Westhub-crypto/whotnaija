import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Trophy, Users, ArrowRight, Play, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import heroImage from '../assets/hero.png';

const FEATURES = [
  { icon: <Trophy size={20} />, title: 'Win Real Cash', desc: 'Stakes from ₦500 to ₦500,000 per player. Win up to ₦1.8 million per game.' },
  { icon: <Shield size={20} />, title: 'Secure & Fair', desc: 'Anti-cheat system and secure payments. Your money is always safe.' },
  { icon: <Users size={20} />, title: 'Real Opponents', desc: 'Play against real Nigerians across the country, day and night.' },
];

const PERKS = [
  '₦500 welcome bonus on registration',
  'Instant withdrawal to your bank',
  'Play 1v1 or 4-player rooms',
  '10% platform fee only',
];

export default function LandingPage() {
  return (
    <div style={{ background: '#06060F', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', position: 'relative', zIndex: 20,
        background: 'rgba(6,6,15,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="WhotNaija" style={{ width: 38, height: 38, borderRadius: 9 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff' }}>
            Whot<span style={{ color: 'var(--brand-gold)' }}>Naija</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Play Now</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh',
        background: 'linear-gradient(135deg, #1a0050 0%, #3a0080 40%, #6C2BD9 70%, #E84393 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Sunburst background lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 8deg, rgba(255,255,255,0.3) 8deg, rgba(255,255,255,0.3) 9deg)',
          backgroundPosition: 'center',
        }} />

        {/* Decorative shapes */}
        {[
          { top: '10%', left: '5%', size: 12, color: '#fff' },
          { top: '20%', right: '8%', size: 16, color: '#F5A623' },
          { top: '60%', left: '3%', size: 10, color: '#fff' },
          { top: '75%', right: '5%', size: 14, color: '#E84393' },
          { top: '40%', left: '30%', size: 8, color: '#fff', shape: 'plus' },
          { top: '15%', right: '25%', size: 10, color: '#fff', shape: 'plus' },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', top: d.top, left: d.left, right: d.right,
            width: d.size, height: d.size, borderRadius: d.shape === 'plus' ? 0 : '50%',
            background: d.color, opacity: 0.6,
          }} />
        ))}

        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '40px 24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          alignItems: 'center', gap: 40, width: '100%', position: 'relative', zIndex: 2,
        }}>
          {/* Left — text */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', borderRadius: 100,
              padding: '6px 16px', marginBottom: 24,
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
                🏆 Nigeria's #1 Whot Card Game
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.05,
              color: '#fff', marginBottom: 20,
            }}>
              Play Whot.<br />
              <span style={{ color: '#F5A623' }}>Win Real</span><br />
              <span style={{ color: '#fff' }}>Cash.</span>
            </h1>

            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 32, lineHeight: 1.7, maxWidth: 440 }}>
              The real Nigerian Whot experience online. Stake money, beat opponents, 
              and withdraw your winnings instantly to your bank account.
            </p>

            {/* Perks list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
              {PERKS.map((perk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={16} style={{ color: '#F5A623', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{perk}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#F5A623', color: '#000', fontWeight: 800,
                padding: '14px 28px', borderRadius: 12, fontSize: 15,
                textDecoration: 'none', boxShadow: '0 8px 24px rgba(245,166,35,0.4)',
              }}>
                <Play size={18} /> Start Playing Free
              </Link>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700,
                padding: '14px 28px', borderRadius: 12, fontSize: 15,
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)',
              }}>
                Login to Account
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32, marginTop: 44, flexWrap: 'wrap' }}>
              {[
                { value: '50,000+', label: 'Players' },
                { value: '₦1.8M', label: 'Max Prize' },
                { value: '24/7', label: 'Live Games' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: '#F5A623' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — hero image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}
          >
            <img
              src={heroImage}
              alt="Play WhotNaija"
              style={{
                width: '100%', maxWidth: 520,
                borderRadius: 24, objectFit: 'cover',
                filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.5))',
              }}
              onError={(e) => {
                // Fallback if image not found — show floating cards
                e.target.style.display = 'none';
              }}
            />
            {/* Floating card decorations always visible */}
            <div style={{ position: 'absolute', display: 'flex', gap: 12, bottom: 40 }}>
              {['⭕','⭐','➕','🔺','⬛'].map((suit, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.4, ease: 'easeInOut', delay: i * 0.2 }}
                  style={{
                    width: 52, height: 72, background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 10, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 18,
                  }}
                >
                  {suit}
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{i * 3 + 2}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to top, #06060F, transparent)',
        }} />
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textAlign: 'center', marginBottom: 8, color: '#fff' }}>
          Why <span style={{ color: 'var(--brand-gold)' }}>WhotNaija</span>?
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 15 }}>
          Built for Nigerians. Fair, fast, and real.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 20, padding: 28,
              }}
            >
              <div style={{
                width: 48, height: 48, background: 'rgba(245,166,35,0.1)',
                borderRadius: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--brand-gold)', marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ROOM SHOWCASE ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textAlign: 'center', marginBottom: 8, color: '#fff' }}>
          Choose Your <span style={{ color: 'var(--brand-gold)' }}>Battle Room</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 15 }}>
          From ₦500 to ₦500,000 stakes. Win up to ₦1.8 million.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { stake: '₦500', prize: '₦1,800', type: '4v4', accent: '#9B6DFF', bg: 'rgba(108,43,217,0.15)' },
            { stake: '₦1,000', prize: '₦3,600', type: '4v4', accent: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
            { stake: '₦5,000', prize: '₦18,000', type: '4v4', accent: '#E84393', bg: 'rgba(232,67,147,0.15)' },
            { stake: '₦20,000', prize: '₦72,000', type: '4v4', accent: '#00D084', bg: 'rgba(0,208,132,0.12)' },
            { stake: '₦100,000', prize: '₦360,000', type: '4v4', accent: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
            { stake: '₦500,000', prize: '₦1.8M', type: '4v4', accent: '#E84393', bg: 'rgba(232,67,147,0.15)' },
          ].map((room, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: room.bg, border: `1px solid ${room.accent}40`,
                borderRadius: 16, padding: '20px 16px', textAlign: 'center',
                aspectRatio: '1', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: room.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {room.type}
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: room.accent }}>
                {room.stake}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Win</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#fff' }}>
                {room.prize}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6C2BD9, #E84393)',
          borderRadius: 24, padding: '60px 40px',
          maxWidth: 760, margin: '0 auto', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            Ready to Play? 🃏
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 32 }}>
            Register now and get ₦500 welcome bonus instantly. No hidden fees.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#fff', color: '#1a0050', fontWeight: 800,
            padding: '15px 36px', borderRadius: 12, fontSize: 16,
            textDecoration: 'none',
          }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)', padding: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={logo} alt="WhotNaija" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff' }}>
            Whot<span style={{ color: 'var(--brand-gold)' }}>Naija</span>
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 WhotNaija. 18+ only. Play responsibly.</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Terms', 'Privacy', 'Support'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
    }
   
