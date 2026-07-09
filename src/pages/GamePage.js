import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import WhotCard from '../components/game/WhotCard';
import { getSocket } from '../utils/socket';
import { useAuthStore, useGameStore, useWalletStore } from '../store';
import { SUIT_ICONS, SUIT_LABELS, formatNaira } from '../utils/socket';
import { speak } from '../utils/voiceService';

const EMOJI_LIST = ['😂', '😎', '🔥', '💪', '🤣', '😏', '👑', '💯', '⚡', '🎯', '😅', '🤔', '😤', '🥳', '💀', '🎉', '👏', '😈', '🃏', '✌️'];

export default function GamePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchBalance } = useWalletStore();

  const [gameState, setGameState] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [canPlayableCards, setCanPlayableCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [voiceText, setVoiceText] = useState(null);
  const [emojiReactions, setEmojiReactions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [recentAction, setRecentAction] = useState(null);
  const [players, setPlayers] = useState([]);
  const [lastDiscarded, setLastDiscarded] = useState(null);
  const [marketEmptyMsg, setMarketEmptyMsg] = useState(null);
  const [rankings, setRankings] = useState(null);

  const timerRef = useRef(null);
  const socket = getSocket();

  // ===================== SETUP =====================
  useEffect(() => {
    if (!socket) {
      navigate('/lobby');
      return;
    }

    socket.emit('joinGameRoom', { roomId });

    socket.on('gameState', (data) => {
      setGameState(data);
      if (data.myHand) setMyHand(data.myHand);
      setIsMyTurn(data.isMyTurn);
      setCanPlayableCards(data.canPlayableCards || []);
      setPlayers(data.players || []);
    });

    socket.on('handUpdate', (data) => {
      setMyHand(data.hand || []);
      setIsMyTurn(data.isMyTurn);
      setCanPlayableCards(data.canPlayableCards || []);
    });

    socket.on('cardPlayed', (data) => {
      setGameState(data.gameState);
      setPlayers(data.gameState.players || []);
      setIsMyTurn(data.gameState.players[data.gameState.currentPlayerIndex]?.userId?.toString() === user?._id?.toString());
      setLastDiscarded(data.card);
      setRecentAction({ player: data.playerName, type: data.effect?.type, card: data.card });
      setSelectedCard(null);

      setTimeout(() => setRecentAction(null), 2500);
    });

    socket.on('voiceAnnouncement', ({ text }) => {
      setVoiceText(text);
      speak(text);
      setTimeout(() => setVoiceText(null), 2200);
    });

    socket.on('marketPick', (data) => {
      setGameState(data.gameState);
      setPlayers(data.gameState.players || []);
    });

    socket.on('lastCardCalled', (data) => {
      toast(`${data.playerName} called Last Card! 🃏`, { icon: '🃏' });
    });

    socket.on('emojiReceived', (data) => {
      const id = Date.now() + Math.random();
      const x = 20 + Math.random() * 60;
      setEmojiReactions(prev => [...prev, { ...data, id, x }]);
      setTimeout(() => {
        setEmojiReactions(prev => prev.filter(r => r.id !== id));
      }, 2000);
    });

    socket.on('marketEmpty', (data) => {
      setMarketEmptyMsg(data.message);
      setTimeout(() => setMarketEmptyMsg(null), 3000);
    });

    socket.on('gameTimeout', (data) => {
      setRankings(data.rankings);
      toast(data.message, { duration: 3000 });
    });

    socket.on('gameOver', (data) => {
      setGameResult(data);
      fetchBalance();
    });

    socket.on('error', (data) => {
      toast.error(data.message);
    });

    return () => {
      socket.off('gameState');
      socket.off('handUpdate');
      socket.off('cardPlayed');
      socket.off('voiceAnnouncement');
      socket.off('marketPick');
      socket.off('lastCardCalled');
      socket.off('emojiReceived');
      socket.off('marketEmpty');
      socket.off('gameTimeout');
      socket.off('gameOver');
      socket.off('error');
    };
  }, [roomId, socket]);

  // ===================== TIMER =====================
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ===================== CARD ACTIONS =====================
  const isCardPlayable = (card) => canPlayableCards.some(c => c.id === card.id);

  const handleCardClick = (card) => {
    if (!isMyTurn) {
      toast.error("It's not your turn yet!");
      return;
    }
    if (!isCardPlayable(card)) return;

    if (card.value === 20) {
      setSelectedCard(card);
      setShowSuitPicker(true);
      return;
    }

    playCard(card, null);
  };

  const playCard = (card, calledSuit) => {
    socket.emit('playCard', { roomId, card, calledSuit });
    setSelectedCard(null);
    setShowSuitPicker(false);

    // Call last card automatically if hand will be 1
    if (myHand.length === 2) {
      setTimeout(() => socket.emit('callLastCard', { roomId }), 300);
    }
  };

  const handleSuitSelect = (suit) => {
    if (selectedCard) playCard(selectedCard, suit);
  };

  const handlePickFromMarket = () => {
    if (!isMyTurn) {
      toast.error("It's not your turn yet!");
      return;
    }
    socket.emit('pickFromMarket', { roomId });
  };

  const handleSendEmoji = (emoji) => {
    socket.emit('sendEmoji', { roomId, emoji });
    setShowEmojiPicker(false);
  };

  const handleExitGame = () => {
    navigate('/lobby');
  };

  // ===================== RENDER HELPERS =====================
  const myPlayerData = players.find(p => p.userId?.toString() === user?._id?.toString());
  const opponents = players.filter(p => p.userId?.toString() !== user?._id?.toString());
  const currentPlayer = gameState ? players[gameState.currentPlayerIndex] : null;

  const SUITS = ['circle', 'star', 'cross', 'triangle', 'square'];

  return (
    <div className="game-board">
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', position: 'relative', zIndex: 5,
      }}>
        <button className="btn btn-icon btn-ghost" onClick={handleExitGame}>
          <X size={18} />
        </button>

        <div className={`game-timer ${timeLeft <= 30 ? 'timer-critical' : timeLeft <= 60 ? 'timer-warning' : ''}`}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {gameState?.calledSuit && (
            <span className="badge badge-gold">
              {SUIT_ICONS[gameState.calledSuit]} {SUIT_LABELS[gameState.calledSuit]} called
            </span>
          )}
        </div>
      </div>

      {/* Game table */}
      <div className="game-table">
        {/* Opponents */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', width: '100%' }}>
          {opponents.map((opp, idx) => {
            const isOppTurn = gameState && players[gameState.currentPlayerIndex]?.username === opp.username;
            return (
              <motion.div key={idx} className="opponent-area" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="player-strip" style={{ borderColor: isOppTurn ? 'var(--brand-gold)' : undefined }}>
                  <div className="player-avatar">{(opp.username || '?')[0].toUpperCase()}</div>
                  <div>
                    <div className="player-name">{opp.username}{opp.isBot && ' 🤖'}</div>
                    <div className="player-card-count">{opp.cardCount} cards</div>
                  </div>
                  {isOppTurn && <div className="turn-indicator" />}
                </div>
                <div style={{ display: 'flex' }}>
                  {Array.from({ length: Math.min(opp.cardCount || 0, 7) }).map((_, i) => (
                    <div key={i} className="opponent-card-back" style={{ marginLeft: i === 0 ? 0 : -28 }} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center: deck + discard */}
        <div className="center-area">
          <div className="deck-pile" onClick={handlePickFromMarket}>
            <WhotCard faceDown size="normal" />
            <div className="deck-count">{gameState?.deckCount || 0} left</div>
          </div>

          <div className="discard-area">
            <AnimatePresence mode="popLayout">
              {gameState?.topCard && (
                <motion.div key={gameState.topCard.id} initial={{ scale: 0.5, rotate: -10, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}>
                  <WhotCard card={gameState.topCard} isPlayable={false} />
                </motion.div>
              )}
            </AnimatePresence>
            {gameState?.calledSuit && (
              <div className="called-suit-badge">{SUIT_ICONS[gameState.calledSuit]} {SUIT_LABELS[gameState.calledSuit]}</div>
            )}
          </div>
        </div>

        {/* Recent action notice */}
        <AnimatePresence>
          {recentAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'var(--bg-card)', border: '1px solid var(--border-glow)',
                padding: '10px 20px', borderRadius: 'var(--radius-full)', fontSize: 13, zIndex: 10,
              }}
            >
              <strong>{recentAction.player}</strong> played {recentAction.card?.value === 20 ? 'Whot' : recentAction.card?.value}
            </motion.div>
          )}
        </AnimatePresence>

        {/* My hand */}
        <div className="my-hand-area">
          <div className="player-strip" style={{ borderColor: isMyTurn ? 'var(--brand-gold)' : undefined, marginBottom: 4 }}>
            <div className="player-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div>
              <div className="player-name">{user?.username} (You)</div>
              <div className="player-card-count">{myHand.length} cards</div>
            </div>
            {isMyTurn && <div className="turn-indicator" />}
          </div>

          {isMyTurn && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: 'var(--brand-gold)', fontWeight: 600 }}>
              {canPlayableCards.length > 0 ? 'Your turn — play a card!' : 'No playable cards — pick from market'}
            </motion.div>
          )}

          <div className="my-cards">
            {myHand.map((card, i) => (
              <WhotCard
                key={card.id}
                card={card}
                index={i}
                isPlayable={isMyTurn && isCardPlayable(card)}
                isSelected={selectedCard?.id === card.id}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>

          {/* Emoji picker toggle */}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowEmojiPicker(v => !v)}>
              😊 Emoji
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="emoji-picker"
                  style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', width: 260 }}
                >
                  {EMOJI_LIST.map(emoji => (
                    <button key={emoji} className="emoji-btn" onClick={() => handleSendEmoji(emoji)}>{emoji}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating emoji reactions */}
      <AnimatePresence>
        {emojiReactions.map(r => (
          <motion.div
            key={r.id}
            className="emoji-reaction"
            style={{ left: `${r.x}%`, bottom: 140 }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Voice announcement toast */}
      <AnimatePresence>
        {voiceText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="voice-toast"
          >
            {voiceText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market empty notice */}
      <AnimatePresence>
        {marketEmptyMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-red)', color: '#fff', padding: '10px 24px', borderRadius: 'var(--radius-full)', zIndex: 100, fontWeight: 600 }}>
            {marketEmptyMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suit picker modal */}
      <AnimatePresence>
        {showSuitPicker && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ maxWidth: 400 }}>
              <h3 className="modal-title">Choose a Suit</h3>
              <p className="text-secondary text-sm mb-4">Select the suit your opponent must play</p>
              <div className="suit-picker">
                {SUITS.map(suit => (
                  <div key={suit} className="suit-option" onClick={() => handleSuitSelect(suit)}>
                    <span>{SUIT_ICONS[suit]}</span>
                    <span>{SUIT_LABELS[suit]}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card count rankings (timeout) */}
      <AnimatePresence>
        {rankings && !gameResult && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <h3 className="modal-title">⏱️ Time's Up! Counting Cards...</h3>
              <div style={{ marginTop: 16 }}>
                {rankings.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>#{i + 1} {r.username}</span>
                    <span style={{ fontWeight: 700, color: i === 0 ? 'var(--brand-green)' : 'var(--text-muted)' }}>{r.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game result overlay */}
      <AnimatePresence>
        {gameResult && (
          <motion.div className="game-result-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="game-result-card"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              {gameResult.winner.username === user?.username ? (
                <>
                  <div className="win-icon">🏆</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--brand-gold)', marginTop: 12 }}>
                    You Won!
                  </h2>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-green)', marginTop: 8 }}>
                    +{formatNaira(gameResult.prize)}
                  </p>
                </>
              ) : (
                <>
                  <div className="lose-icon">😔</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 12 }}>
                    {gameResult.winner.username} Won
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                    Better luck next time!
                  </p>
                </>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="btn btn-primary" onClick={() => navigate('/lobby')}>Play Again</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
