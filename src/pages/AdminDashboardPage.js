import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, Gamepad2, HeadphonesIcon,
  Shield, LogOut, Search, Ban, CheckCircle2, AlertTriangle, TrendingUp, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../utils/adminApi';
import { formatNaira, formatDate } from '../utils/socket';

const NAV_SECTIONS = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { key: 'users', label: 'Users', icon: <Users size={18} /> },
  { key: 'transactions', label: 'Transactions', icon: <CreditCard size={18} /> },
  { key: 'games', label: 'Games', icon: <Gamepad2 size={18} /> },
  { key: 'support', label: 'Support Tickets', icon: <HeadphonesIcon size={18} /> },
  { key: 'anticheat', label: 'Anti-Cheat', icon: <Shield size={18} /> },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const adminInfo = JSON.parse(localStorage.getItem('whotnaija_admin_info') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('whotnaija_admin_token');
    localStorage.removeItem('whotnaija_admin_info');
    navigate('/masteradmin');
  };

  return (
    <div className="app-layout" style={{ background: '#020208' }}>
      {/* Admin Sidebar */}
      <div className="sidebar" style={{ background: '#0A0A18' }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #6C2BD9, #E84393)' }}>
            <Shield size={18} />
          </div>
          <span className="sidebar-logo-text">Admin Panel</span>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{adminInfo.username || 'Admin'}</div>
          <div style={{ fontSize: 11, color: '#9B6DFF' }}>{adminInfo.role || 'admin'}</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(item => (
            <button
              key={item.key}
              className={`nav-item${activeSection === item.key ? ' active' : ''}`}
              onClick={() => setActiveSection(item.key)}
              style={activeSection === item.key ? { background: 'rgba(108,43,217,0.15)', color: '#9B6DFF', borderColor: 'rgba(108,43,217,0.3)' } : {}}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--brand-red)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="main-content" style={{ background: '#020208' }}>
        <div style={{
          height: 64, background: '#0A0A18', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>
            {activeSection.replace('-', ' ')}
          </h2>
        </div>

        <div style={{ padding: 24 }}>
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'transactions' && <TransactionsSection />}
          {activeSection === 'games' && <GamesSection />}
          {activeSection === 'support' && <SupportSection />}
          {activeSection === 'anticheat' && <AntiCheatSection />}
        </div>
      </div>
    </div>
  );
}

// ==================== OVERVIEW ====================
function OverviewSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.get('/admin/dashboard').then(res => setData(res.data.data)).catch(() => toast.error('Failed to load dashboard'));
  }, []);

  if (!data) return <div className="skeleton" style={{ height: 300 }} />;

  const stats = [
    { label: 'Total Users', value: data.users.total, icon: <Users size={20} />, color: '#9B6DFF', sub: `+${data.users.today} today` },
    { label: 'Active Now', value: data.users.active, icon: <TrendingUp size={20} />, color: '#00D084' },
    { label: 'Platform Revenue', value: formatNaira(data.finance.platformRevenue), icon: <DollarSign size={20} />, color: '#F5A623' },
    { label: 'Total Deposits', value: formatNaira(data.finance.totalDeposits), icon: <CreditCard size={20} />, color: '#E84393' },
    { label: 'Total Withdrawals', value: formatNaira(data.finance.totalWithdrawals), icon: <CreditCard size={20} />, color: '#FF4444' },
    { label: 'Total Games', value: data.games.total, icon: <Gamepad2 size={20} />, color: '#00D084', sub: `${data.games.active} active` },
    { label: 'Open Tickets', value: data.support.openTickets, icon: <HeadphonesIcon size={20} />, color: '#F5A623' },
    { label: 'Banned Users', value: data.users.banned, icon: <Ban size={20} />, color: '#FF4444' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            <div>
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}{s.sub && ` • ${s.sub}`}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==================== USERS ====================
function UsersSection() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, [search]);

  const loadUsers = async () => {
    try {
      const { data } = await adminApi.get(`/admin/users?search=${search}&limit=50`);
      setUsers(data.users);
    } catch {} finally { setLoading(false); }
  };

  const handleBan = async (id) => {
    const reason = window.prompt('Ban reason:');
    if (!reason) return;
    try {
      await adminApi.patch(`/admin/users/${id}/ban`, { reason });
      toast.success('User banned');
      loadUsers();
    } catch { toast.error('Failed to ban user'); }
  };

  const handleUnban = async (id) => {
    try {
      await adminApi.patch(`/admin/users/${id}/unban`);
      toast.success('User unbanned');
      loadUsers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="card">
      <div className="input-with-icon" style={{ marginBottom: 20, maxWidth: 320 }}>
        <Search className="input-icon" size={16} />
        <input className="input" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Username</th><th>Email</th><th>Balance</th><th>Games</th><th>Status</th><th>Joined</th><th>Action</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>@{u.username}</td>
                <td>{u.email}</td>
                <td>{formatNaira(u.wallet?.balance)}</td>
                <td>{u.gameStats?.totalGames || 0}</td>
                <td><span className={`badge ${u.isBanned ? 'badge-red' : 'badge-green'}`}>{u.isBanned ? 'Banned' : 'Active'}</span></td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  {u.isBanned ? (
                    <button className="btn btn-sm btn-success" onClick={() => handleUnban(u._id)}>Unban</button>
                  ) : (
                    <button className="btn btn-sm btn-danger" onClick={() => handleBan(u._id)}>Ban</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== TRANSACTIONS ====================
function TransactionsSection() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    adminApi.get(`/admin/transactions?type=${filterType}&limit=50`).then(res => setTransactions(res.data.transactions)).catch(() => {});
  }, [filterType]);

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'deposit', 'withdrawal', 'game-win', 'game-stake'].map(t => (
          <button key={t} className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterType(t)}>
            {t || 'All'}
          </button>
        ))}
      </div>
      <table className="data-table">
        <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th><th>Date</th></tr></thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={i}>
              <td>{tx.userId?.username || 'N/A'}</td>
              <td>{tx.type}</td>
              <td>{formatNaira(tx.amount)}</td>
              <td><span className={`badge ${tx.status === 'completed' ? 'badge-green' : tx.status === 'pending' ? 'badge-gold' : 'badge-red'}`}>{tx.status}</span></td>
              <td style={{ fontSize: 11 }}>{tx.reference}</td>
              <td>{formatDate(tx.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== GAMES ====================
function GamesSection() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    adminApi.get('/admin/games?limit=50').then(res => setGames(res.data.games)).catch(() => {});
  }, []);

  return (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>Room ID</th><th>Type</th><th>Stake</th><th>Players</th><th>Status</th><th>Winner</th><th>Date</th></tr></thead>
        <tbody>
          {games.map((g, i) => (
            <tr key={i}>
              <td style={{ fontSize: 11 }}>{g.roomId}</td>
              <td>{g.roomType}</td>
              <td>{formatNaira(g.stakeAmount)}</td>
              <td>{g.players?.length}</td>
              <td><span className={`badge ${g.status === 'completed' ? 'badge-green' : g.status === 'in-progress' ? 'badge-gold' : 'badge-gray'}`}>{g.status}</span></td>
              <td>{g.winner?.username || '-'}{g.winner?.isBot && ' 🤖'}</td>
              <td>{formatDate(g.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== SUPPORT ====================
function SupportSection() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    adminApi.get('/admin/support?limit=50').then(res => setTickets(res.data.tickets)).catch(() => {});
  }, []);

  return (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>Ticket ID</th><th>User</th><th>Subject</th><th>Category</th><th>Status</th><th>Last Activity</th></tr></thead>
        <tbody>
          {tickets.map((t, i) => (
            <tr key={i}>
              <td style={{ fontSize: 11 }}>{t.ticketId}</td>
              <td>{t.userId?.username}</td>
              <td>{t.subject}</td>
              <td>{t.category}</td>
              <td><span className={`badge ${t.status === 'open' ? 'badge-gold' : t.status === 'resolved' ? 'badge-green' : 'badge-purple'}`}>{t.status}</span></td>
              <td>{formatDate(t.lastActivityAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== ANTI-CHEAT ====================
function AntiCheatSection() {
  const [flagged, setFlagged] = useState([]);

  useEffect(() => {
    adminApi.get('/admin/anti-cheat/flags').then(res => setFlagged(res.data.flaggedUsers)).catch(() => {});
  }, []);

  return (
    <div className="card">
      {flagged.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <CheckCircle2 size={32} style={{ color: 'var(--brand-green)', marginBottom: 12 }} />
          <p className="text-muted">No suspicious activity detected</p>
        </div>
      ) : (
        <table className="data-table">
          <thead><tr><th>User</th><th>Risk Score</th><th>Flags</th><th>Suspicious Count</th><th>Last Flagged</th></tr></thead>
          <tbody>
            {flagged.map((u, i) => (
              <tr key={i}>
                <td>{u.username}</td>
                <td>
                  <span className={`badge ${u.antiCheat.riskScore > 70 ? 'badge-red' : 'badge-gold'}`}>
                    <AlertTriangle size={12} style={{ marginRight: 4 }} />{u.antiCheat.riskScore}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{u.antiCheat.flags?.slice(-2).join(', ')}</td>
                <td>{u.antiCheat.suspiciousActivityCount}</td>
                <td>{u.antiCheat.lastFlaggedAt ? formatDate(u.antiCheat.lastFlaggedAt) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
