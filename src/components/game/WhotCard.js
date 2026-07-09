import React from 'react';
import { motion } from 'framer-motion';
import { SUIT_ICONS } from '../../utils/socket';

export default function WhotCard({ card, isPlayable, isSelected, onClick, size = 'normal', faceDown = false, index = 0 }) {
  if (faceDown) {
    return (
      <motion.div
        className="whot-card back"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.03 }}
      />
    );
  }

  if (!card) return null;

  const suitClass = `suit-${card.suit}`;
  const displayValue = card.value === 20 ? 'WHOT' : card.value;
  const icon = SUIT_ICONS[card.suit] || '🃏';

  return (
    <motion.div
      className={`whot-card ${suitClass}${isPlayable ? ' playable' : ''}${isSelected ? ' selected' : ''}`}
      onClick={isPlayable ? onClick : undefined}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={isPlayable ? { y: -12, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      layout
    >
      <div className="card-inner">
        <span className="card-corner-tl">{card.value === 20 ? 'W' : card.value}</span>
        <span className="card-value" style={{ fontSize: card.value === 20 ? 14 : 22 }}>
          {displayValue}
        </span>
        <span className="card-suit-icon">{icon}</span>
        <span className="card-corner-br">{card.value === 20 ? 'W' : card.value}</span>
      </div>
    </motion.div>
  );
}
