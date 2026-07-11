import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, X, Search, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from './DashboardPage';
import { useWalletStore } from '../store';
import { getSocket } from '../utils/socket';
import { formatNaira, ROOM_CONFIGS } from '../utils/socket';

const SUIT_COLORS = ['#9B6DFF','#F5A623','#E84393','#00D084','#FF4444','#00BFFF'];
const SUITS = ['⭕','⭐','➕','🔺','⬛'];

export default function LobbyPage() {
  const navigate = useNavigate();
  const { balance, bonusBalance, fetchBalance } = useWalletStore();
  const [filter, setFilter] = useState('all');
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const totalBalance = balance + bonusBalance;

  useEffect(() => {
    fetchBalance();
    const socket = getSocket();
    if (!socket) return;

    socket.on('matchFound', (data) => {
      setSearching(false);
      toast.success('Match found! Starting game...');
      setTimeout(() => navigate(`/game/${data.roomId}`), 500);
    });
    socket.on('error', (data) => { toast.error(data.message); setSearching(false); });
    return () => { socket.off('matchFound'); socket.off('error'); };
  }, []);

  useEffect(() => {
    let interval;
    if (searching) interval = setInterval(() => setSearchTime(t => t + 1), 1000);
    else setSearchTime(0);
    return () => clearInterval(interval);
  }, [searching]);

  const handleJoinRoom = (room) => {
    if (totalBalance < room.stakeAmount) {
      toast.error(`You need ${formatNaira(room.stakeAmount)} to join this room`);
      return;
    }
    const socket = getSocket();
    if (!socket) { toast.error('Connection error. Please refresh.'); return; }
    setSelectedRoom(room);
    setSearching(true);
    socket.emit('joinMatchmaking', { stakeAmount: room.stakeAmount, roomType: room.roomType });
  };

  const handleCancel = () => {
    const socket = getSocket();
    if (socket && selectedRoom) {
      socket.emit('leaveMatchmaking', { stakeAmount: selectedRoom.stakeAmount, roomType: selectedRoom.roomType });
    }
    setSearching(false);
    setSelectedRoom(null);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const filteredRooms = filter === 'all' ? ROOM_CONFIGS
    : ROOM_CONFIGS.filter(r => r.roomType === (filter === '1v1' ? '1v1' : '4v4'));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Game Lobby" />

        <div style={{ padding: '20px 16px', paddingBottom: 100 }}>
          {/* Balance bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 16, padding: '14px 16px', marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Available to Play</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--brand-gold)' }}>
                {formatNaira(totalBalance)}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/wallet')}>+ Top Up</button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { key: 'all', label: 'All Rooms' },
              { key: '1v1', label: '1 vs 1' },
              { key: '4v4', label: '4 Players' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: filter === tab.key ? 'var(--grad-brand)' : 'var(--bg-card2)',
                  color: filter === tab.key ? '#fff' : 'var(--text-secondary)',
                  boxShadow: filter === tab.key ? '0 4px 14px rgba(245,166,35,0.3)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Room grid — square cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}>
            {filteredRooms.map((room, i) => {
              const accent = SUIT_COLORS[i % SUIT_COLORS.length];
              const suit = SUITS[i % SUITS.length];
              const canPlay = totalBalance >= room.stakeAmount;

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleJoinRoom(room)}
                  style={{
                    background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                    border: `1px solid ${accent}35`,
                    borderRadius: 18,
                    padding: 16,
                    cursor: canPlay ? 'pointer' : 'not-allowed',
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: canPlay ? 1 : 0.75,
                  }}
                >
                  {/* Background suit watermark */}
                  <div style={{
                    position: 'absolute', bottom: -10, right: -10,
                    fontSize: 64, opacity: 0.08, lineHeight: 1,
                    pointerEvents: 'none',
                  }}>
                    {suit}
                  </div>

                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: accent,
                      background: `${accent}20`, padding: '3px 8px',
                      borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {room.roomType === '1v1' ? '1v1' : '4P'}
                    </span>
                    <span style={{ fontSize: 16 }}>{suit}</span>
                  </div>

                  {/* Stake amount */}
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: room.stakeAmount >= 100000 ? 16 : 22,
                      fontWeight: 900, color: accent, lineHeight: 1.1, marginBottom: 2,
                    }}>
                      {room.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>stake</div>
                  </div>

                  {/* Bottom — prize + join */}
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Win up to</div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: room.prize >= 1000000 ? 13 : 15,
                      fontWeight: 800, color: '#fff', marginBottom: 10,
                    }}>
                      {formatNaira(room.prize)}
                    </div>
                    <div style={{
                      background: canPlay ? accent : 'rgba(255,255,255,0.1)',
                      color: canPlay ? '#fff' : 'rgba(255,255,255,0.4)',
                      borderRadius: 8, padding: '7px 0', textAlign: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {canPlay ? 'Join Room' : 'Low Balance'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Searching overlay */}
        <AnimatePresence>
          {searching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(6,6,15,0.95)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 300, gap: 24,
              }}
            >
              {/* Animated cards */}
              <div style={{ display: 'flex', gap: 8 }}>
                {SUITS.map((suit, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -16, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15, ease: 'easeInOut' }}
                    style={{
                      width: 44, height: 60, background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}
                  >
                    {suit}
                  </motion.div>
                ))}
              </div>

              {/* Spinner */}
              <div style={{
                width: 64, height: 64, border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--brand-gold)', borderRadius: '50%',
                animation: 'spin 0.9s linear infinite',
              }} />

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Finding Opponent...
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {selectedRoom?.label} · {selectedRoom?.roomType === '1v1' ? '1 vs 1' : '4 Players'}
                </p>
              </div>

              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
                color: 'var(--brand-gold)',
              }}>
                {formatTime(searchTime)}
              </div>

              <button className="btn btn-ghost" onClick={handleCancel}>
                <X size={16} /> Cancel Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
