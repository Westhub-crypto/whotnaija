import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Gamepad2, Wallet, User, Users, HeadphonesIcon,
  LogOut, Menu, X, Trophy, Bell, ChevronRight, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useWalletStore, useUIStore } from '../store';
import { getSocket } from '../utils/socket';
import { formatNaira, ROOM_CONFIGS } from '../utils/socket';
import api from '../utils/api';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Gamepad2 size={18} />, label: 'Play Game', path: '/lobby' },
  { icon: <Wallet size={18} />, label: 'Wallet', path: '/wallet' },
  { icon: <User size={18} />, label: 'Profile', path: '/profile' },
  { icon: <Users size={18} />, label: 'Referrals', path: '/referral' },
  { icon: <HeadphonesIcon size={18} />, label: 'Support', path: '/support' },
];

// ========================
// SIDEBAR COMPONENT
// ========================
export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { balance, bonusBalance } = useWalletStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={logo} alt="WhotNaija" className="sidebar-logo-icon" style={{ objectFit: 'cover' }} />
          <span className="sidebar-logo-text">
            Whot<span style={{ color: 'var(--brand-gold)' }}>Naija</span>
          </span>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', display: 'none' }}
            id="sidebar-close"
          >
            <X size={16} />
          </button>
        </div>

        {/* User mini card */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="player-avatar" style={{ width: 38, height: 38, fontSize: 15 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{user?.username}</div>
              <div style={{ fontSize: 11, color: 'var(--brand-gold)' }}>{formatNaira(balance + bonusBalance)}</div>
            </div>
            <div className="online-dot" />
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--brand-red)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

// ========================
// TOPBAR COMPONENT
// ========================
export function Topbar({ title }) {
  const { toggleSidebar, onlineCount } = useUIStore();
  const { balance, bonusBalance } = useWalletStore();
  const { user } = useAuthStore();

  return (
    <div style={{
      height: 64, background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-icon btn-ghost" onClick={toggleSidebar} style={{ display: 'none' }} id="menu-btn">
          <Menu size={20} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card2)', borderRadius: 'var(--radius-full)', padding: '6px 14px', border: '1px solid var(--border-subtle)' }}>
          <span className="online-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{onlineCount.toLocaleString()} online</span>
        </div>
        <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 'var(--radius-full)', padding: '6px 14px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-gold)' }}>
            {formatNaira(balance + bonusBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ========================
// DASHBOARD PAGE
// ========================
export default function DashboardPage() {
  const { user, refreshUser } = useAuthStore();
  const { fetchBalance, balance, bonusBalance, hasDeposited } = useWalletStore();
  const { setOnlineCount } = useUIStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    fetchBalance();
    refreshUser();
    loadStats();

    const socket = getSocket();
    if (socket) {
      socket.on('onlineCount', setOnlineCount);
      return () => socket.off('onlineCount', setOnlineCount);
    }
  }, []);

  const loadStats = async () => {
    try {
      const [gamesRes] = await Promise.all([
        api.get('/rooms/my-history?limit=5'),
      ]);
      setRecentGames(gamesRes.data.rooms || []);
    } catch {}
  };

  const wins = user?.gameStats?.wins || 0;
  const totalGames = user?.gameStats?.totalGames || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Dashboard" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: 24 }}
        >
          {/* Welcome banner */}
          <div style={{
            background: 'var(--grad-brand)', borderRadius: 'var(--radius-xl)',
            padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 4, position: 'relative' }}>
              Welcome back, {user?.firstName}! 🃏
            </h2>
            <p style={{ opacity: 0.9, fontSize: 14, marginBottom: 20, position: 'relative', color: '#fff' }}>
              {hasDeposited
                ? `You have ${formatNaira(balance + bonusBalance)} ready to play.`
                : `Make your first deposit and unlock your ₦500 bonus!`}
            </p>
            <button className="btn" style={{ background: '#fff', color: '#0C0C1E', fontWeight: 700 }}
              onClick={() => navigate('/lobby')}>
              Play Now <ChevronRight size={16} />
            </button>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Wallet Balance', value: formatNaira(balance), icon: '💰', color: 'var(--brand-gold)' },
              { label: 'Bonus Balance', value: formatNaira(bonusBalance), icon: '🎁', color: 'var(--brand-green)' },
              { label: 'Total Wins', value: wins, icon: '🏆', color: 'var(--brand-pink)' },
              { label: 'Win Rate', value: `${winRate}%`, icon: '📊', color: '#9B6DFF' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>{stat.label}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                  </div>
                  <span style={{ fontSize: 28 }}>{stat.icon}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Quick play */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Play</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ROOM_CONFIGS.slice(0, 4).map((room) => (
                  <button
                    key={room.id}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between', textAlign: 'left' }}
                    onClick={() => navigate('/lobby')}
                  >
                    <span>{room.label} — {room.type}</span>
                    <span style={{ color: 'var(--brand-gold)', fontSize: 12 }}>Win {formatNaira(room.prize)}</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-full" style={{ marginTop: 12 }} onClick={() => navigate('/lobby')}>
                View All Rooms
              </button>
            </div>

            {/* Recent games */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                <TrendingUp size={16} style={{ display: 'inline', marginRight: 6 }} />
                Recent Games
              </h3>
              {recentGames.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🃏</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No games yet. Start playing!</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/lobby')}>
                    Play First Game
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentGames.map((game, i) => {
                    const isWin = game.winner?.userId === user?._id;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{game.roomType} — {formatNaira(game.stakeAmount)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(game.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`badge ${isWin ? 'badge-green' : 'badge-red'}`}>
                          {isWin ? 'Win' : 'Loss'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Deposit CTA if not deposited */}
          {!hasDeposited && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>🎁 Unlock Your ₦500 Welcome Bonus</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Make your first deposit (min ₦1,000) to activate your bonus and start withdrawing.</div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/wallet')}>Deposit Now</button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
