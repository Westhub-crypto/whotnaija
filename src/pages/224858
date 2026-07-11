import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Gamepad2, Wallet, User, Users, HeadphonesIcon,
  LogOut, Menu, X, Trophy, TrendingUp, ChevronRight, Bell,
  Gift, Home, Star, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useWalletStore, useUIStore } from '../store';
import { getSocket } from '../utils/socket';
import { formatNaira, ROOM_CONFIGS, getOnlineCount } from '../utils/socket';
import api from '../utils/api';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Gamepad2 size={20} />, label: 'Play Game', path: '/lobby' },
  { icon: <Wallet size={20} />, label: 'Wallet', path: '/wallet' },
  { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  { icon: <Users size={20} />, label: 'Referrals', path: '/referral' },
  { icon: <HeadphonesIcon size={20} />, label: 'Support', path: '/support' },
];

// ========================
// SIDEBAR
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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 99 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ padding: '20px 16px' }}>
          <img src={logo} alt="WhotNaija" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800 }}>
            Whot<span style={{ color: 'var(--brand-gold)' }}>Naija</span>
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }}
            id="sidebar-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', margin: '0 8px 8px', background: 'var(--bg-glass)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: 'var(--grad-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--brand-gold)', fontWeight: 600 }}>
                {formatNaira(balance + bonusBalance)}
              </div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-green)', boxShadow: '0 0 6px var(--brand-green)', flexShrink: 0 }} />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10, marginBottom: 2,
                  textDecoration: 'none', transition: 'var(--transition)',
                  background: isActive ? 'rgba(245,166,35,0.12)' : 'transparent',
                  color: isActive ? 'var(--brand-gold)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(245,166,35,0.2)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 400, fontSize: 14,
                }}
              >
                {item.icon}
                {item.label}
                {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--brand-red)', fontSize: 14, fontWeight: 500,
            }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

// ========================
// TOPBAR
// ========================
export function Topbar({ title }) {
  const { toggleSidebar } = useUIStore();
  const { balance, bonusBalance } = useWalletStore();
  const [onlineCount, setOnlineCount] = useState(getOnlineCount(0));

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('onlineCount', (c) => setOnlineCount(getOnlineCount(c)));
    }
    // Pulse online count slightly every 30s for realism
    const interval = setInterval(() => setOnlineCount(getOnlineCount(0)), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: 60, background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
          className="mobile-menu-btn"
        >
          <Menu size={22} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#fff' }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-card2)', borderRadius: 100,
          padding: '5px 12px', border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-green)', boxShadow: '0 0 6px var(--brand-green)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{onlineCount.toLocaleString()} online</span>
        </div>
        <Link to="/wallet" style={{
          background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
          borderRadius: 100, padding: '5px 14px', textDecoration: 'none',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-gold)' }}>
            {formatNaira(balance + bonusBalance)}
          </span>
        </Link>
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
  const navigate = useNavigate();
  const location = useLocation();
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    fetchBalance();
    refreshUser();
    api.get('/rooms/my-history?limit=4').then(r => setRecentGames(r.data.rooms || [])).catch(() => {});
  }, []);

  const stats = user?.gameStats || {};
  const wins = stats.wins || 0;
  const totalGames = stats.totalGames || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  // Bottom nav items for mobile quick access
  const QUICK_NAV = [
    { icon: <Home size={22} />, label: 'Home', path: '/dashboard' },
    { icon: <Gamepad2 size={22} />, label: 'Play', path: '/lobby' },
    { icon: <Wallet size={22} />, label: 'Wallet', path: '/wallet' },
    { icon: <Gift size={22} />, label: 'Referral', path: '/referral' },
    { icon: <User size={22} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Dashboard" />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px 16px', paddingBottom: 100 }}>

          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #6C2BD9 0%, #E84393 100%)',
            borderRadius: 20, padding: '24px 20px', marginBottom: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Welcome back</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                {user?.firstName} {user?.lastName} 🃏
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
                {hasDeposited
                  ? `Total Balance: ${formatNaira(balance + bonusBalance)}`
                  : 'Make your first deposit and unlock your ₦500 bonus!'}
              </p>
              <button
                className="btn"
                style={{ background: '#fff', color: '#6C2BD9', fontWeight: 800, fontSize: 13, padding: '10px 20px', borderRadius: 10 }}
                onClick={() => navigate('/lobby')}
              >
                Play Now →
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Wallet', value: formatNaira(balance), icon: '💰', color: '#F5A623' },
              { label: 'Bonus', value: formatNaira(bonusBalance), icon: '🎁', color: '#00D084', note: hasDeposited ? null : 'Locked' },
              { label: 'Total Wins', value: wins, icon: '🏆', color: '#E84393' },
              { label: 'Win Rate', value: `${winRate}%`, icon: '📈', color: '#9B6DFF' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 16, padding: '16px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
                {s.note && <span style={{ fontSize: 10, color: 'var(--brand-red)', fontWeight: 600 }}>{s.note}</span>}
              </motion.div>
            ))}
          </div>

          {/* Quick Nav Cards */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Quick Access</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { icon: <Gamepad2 size={22} />, label: 'Play Game', path: '/lobby', color: '#6C2BD9', bg: 'rgba(108,43,217,0.15)' },
              { icon: <Wallet size={22} />, label: 'Wallet', path: '/wallet', color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
              { icon: <Gift size={22} />, label: 'Referrals', path: '/referral', color: '#E84393', bg: 'rgba(232,67,147,0.12)' },
              { icon: <User size={22} />, label: 'Profile', path: '/profile', color: '#00D084', bg: 'rgba(0,208,132,0.12)' },
              { icon: <Trophy size={22} />, label: 'Leaderboard', path: '/lobby', color: '#9B6DFF', bg: 'rgba(155,109,255,0.12)' },
              { icon: <HeadphonesIcon size={22} />, label: 'Support', path: '/support', color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(item.path)}
                style={{
                  background: item.bg, border: `1px solid ${item.color}30`,
                  borderRadius: 14, padding: '16px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 8, cursor: 'pointer', textAlign: 'center',
                }}
              >
                <div style={{ color: item.color }}>{item.icon}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Quick Play Rooms */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Quick Play</h3>
              <button onClick={() => navigate('/lobby')} style={{ fontSize: 12, color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                View All →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROOM_CONFIGS.slice(0, 5).map((room) => (
                <button
                  key={room.id}
                  onClick={() => navigate('/lobby')}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: 12, padding: '14px 16px', cursor: 'pointer', width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(108,43,217,0.2)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Zap size={16} style={{ color: '#9B6DFF' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{room.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{room.roomType} · {room.players} players</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Win</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-green)' }}>{formatNaira(room.prize)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Recent Games</h3>
            {recentGames.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 16, padding: '32px 20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🃏</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>No games yet. Start playing!</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/lobby')}>
                  Play Your First Game
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentGames.map((game, i) => {
                  const isWin = game.winner?.userId === user?._id;
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                      borderRadius: 12, padding: '14px 16px',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                          {game.roomType} — {formatNaira(game.stakeAmount)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(game.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                        background: isWin ? 'rgba(0,208,132,0.15)' : 'rgba(255,68,68,0.15)',
                        color: isWin ? 'var(--brand-green)' : 'var(--brand-red)',
                      }}>
                        {isWin ? '+ Win' : 'Loss'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deposit CTA */}
          {!hasDeposited && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)',
                borderRadius: 16, padding: '18px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>🎁 Unlock ₦500 Bonus</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deposit min ₦1,000 to activate your bonus</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/wallet')}>Deposit Now</button>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom nav for mobile */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '10px 0 16px', zIndex: 100,
        }}>
          {QUICK_NAV.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  textDecoration: 'none', color: isActive ? 'var(--brand-gold)' : 'var(--text-muted)',
                  fontSize: 10, fontWeight: isActive ? 700 : 400, minWidth: 56,
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
