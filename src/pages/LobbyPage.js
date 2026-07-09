import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from './DashboardPage';
import { useWalletStore, useGameStore } from '../store';
import { getSocket } from '../utils/socket';
import { formatNaira, ROOM_CONFIGS } from '../utils/socket';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { balance, bonusBalance, fetchBalance } = useWalletStore();
  const { matchmaking, setMatchmaking, resetGame } = useGameStore();
  const [filter, setFilter] = useState('all'); // all, 1v1, 4v4
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const totalBalance = balance + bonusBalance;

  useEffect(() => {
    fetchBalance();
    const socket = getSocket();
    if (!socket) return;

    socket.on('matchmakingStatus', (data) => {
      if (data.status === 'searching') {
        setSearching(true);
      } else if (data.status === 'left') {
        setSearching(false);
        setSearchTime(0);
      }
    });

    socket.on('matchFound', (data) => {
      setSearching(false);
      toast.success(data.hasBot ? 'Opponent found! Starting game...' : 'Match found!');
      setTimeout(() => navigate(`/game/${data.roomId}`), 500);
    });

    socket.on('error', (data) => {
      toast.error(data.message);
      setSearching(false);
    });

    return () => {
      socket.off('matchmakingStatus');
      socket.off('matchFound');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    let interval;
    if (searching) {
      interval = setInterval(() => setSearchTime(t => t + 1), 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [searching]);

  const handleJoinRoom = (room) => {
    if (totalBalance < room.stakeAmount) {
      toast.error(`Insufficient balance. You need ${formatNaira(room.stakeAmount)} to join this room.`);
      return;
    }

    const socket = getSocket();
    if (!socket) {
      toast.error('Connection error. Please refresh the page.');
      return;
    }

    setSelectedRoom(room);
    setSearching(true);
    socket.emit('joinMatchmaking', { stakeAmount: room.stakeAmount, roomType: room.roomType });
  };

  const handleCancelSearch = () => {
    const socket = getSocket();
    if (socket && selectedRoom) {
      socket.emit('leaveMatchmaking', { stakeAmount: selectedRoom.stakeAmount, roomType: selectedRoom.roomType });
    }
    setSearching(false);
    setSearchTime(0);
  };

  const filteredRooms = filter === 'all'
    ? ROOM_CONFIGS
    : ROOM_CONFIGS.filter(r => r.roomType === filter);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Game Lobby" />

        <div style={{ padding: 24 }}>
          {/* Balance reminder */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24, flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Available to Play</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--brand-gold)' }}>
                {formatNaira(totalBalance)}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/wallet')}>
              + Top Up
            </button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[
              { key: 'all', label: 'All Rooms' },
              { key: '1v1', label: '1 vs 1' },
              { key: '4v4', label: '4 Players' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Room grid */}
          <div className="room-cards-grid">
            {filteredRooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="room-card"
                onClick={() => handleJoinRoom(room)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span className={`room-type-badge room-type-${room.roomType}`}>
                    {room.roomType === '1v1' ? <User size={12} style={{ marginRight: 4 }} /> : <Users size={12} style={{ marginRight: 4 }} />}
                    {room.roomType === '1v1' ? '1 vs 1' : '4 Players'}
                  </span>
                  <span className="badge badge-gray">{room.players} seats</span>
                </div>

                <div className="room-stake">{room.label}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 16 }}>
                  Stake per player
                </p>

                <div className="divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Winner takes</div>
                    <div style={{ fontWeight: 700, color: 'var(--brand-green)' }}>{formatNaira(room.prize)}</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={totalBalance < room.stakeAmount}
                    onClick={(e) => { e.stopPropagation(); handleJoinRoom(room); }}
                  >
                    {totalBalance < room.stakeAmount ? 'Low Balance' : 'Join'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Matchmaking overlay */}
        <AnimatePresence>
          {searching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="matching-overlay"
            >
              <button
                className="modal-close"
                style={{ position: 'fixed', top: 24, right: 24 }}
                onClick={handleCancelSearch}
              >
                <X size={18} />
              </button>

              <div className="matching-cards">
                <div className="whot-card back" />
              </div>

              <div className="matching-spinner" />

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
                <Search size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Looking for Opponents...
              </h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 320 }}>
                Searching for players in the {selectedRoom?.label} {selectedRoom?.roomType} room.
                {searchTime >= 5 && ' Connecting you with the best available opponent...'}
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-card)', padding: '8px 20px', borderRadius: 'var(--radius-full)',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
                  {formatTime(searchTime)}
                </span>
              </div>

              <button className="btn btn-ghost" onClick={handleCancelSearch}>
                Cancel Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
