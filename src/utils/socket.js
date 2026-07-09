import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(process.env.REACT_APP_SOCKET_URL || '', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('Socket connected:', socket.id));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Nigerian state and LGA data
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const SUIT_ICONS = {
  circle: '⭕',
  star: '⭐',
  cross: '➕',
  triangle: '🔺',
  square: '⬛',
  whot: '🃏',
};

export const SUIT_LABELS = {
  circle: 'Circle',
  star: 'Star',
  cross: 'Cross',
  triangle: 'Triangle',
  square: 'Square',
  whot: 'Whot',
};

export const ROOM_CONFIGS = [
  { id: 'r1', stakeAmount: 500, roomType: '1v1', label: '₦500', desc: '1 vs 1 — Win ₦900', prize: 900, players: 2 },
  { id: 'r2', stakeAmount: 1000, roomType: '1v1', label: '₦1,000', desc: '1 vs 1 — Win ₦1,800', prize: 1800, players: 2 },
  { id: 'r3', stakeAmount: 2000, roomType: '1v1', label: '₦2,000', desc: '1 vs 1 — Win ₦3,600', prize: 3600, players: 2 },
  { id: 'r4', stakeAmount: 5000, roomType: '1v1', label: '₦5,000', desc: '1 vs 1 — Win ₦9,000', prize: 9000, players: 2 },
  { id: 'r5', stakeAmount: 500, roomType: '4v4', label: '₦500', desc: '4 Players — Win ₦1,800', prize: 1800, players: 4 },
  { id: 'r6', stakeAmount: 1000, roomType: '4v4', label: '₦1,000', desc: '4 Players — Win ₦3,600', prize: 3600, players: 4 },
  { id: 'r7', stakeAmount: 5000, roomType: '4v4', label: '₦5,000', desc: '4 Players — Win ₦18,000', prize: 18000, players: 4 },
  { id: 'r8', stakeAmount: 10000, roomType: '1v1', label: '₦10,000', desc: '1 vs 1 — Win ₦18,000', prize: 18000, players: 2 },
  { id: 'r9', stakeAmount: 20000, roomType: '1v1', label: '₦20,000', desc: '1 vs 1 — Win ₦36,000', prize: 36000, players: 2 },
  { id: 'r10', stakeAmount: 10000, roomType: '4v4', label: '₦10,000', desc: '4 Players — Win ₦36,000', prize: 36000, players: 4 },
  { id: 'r11', stakeAmount: 20000, roomType: '4v4', label: '₦20,000', desc: '4 Players — Win ₦72,000', prize: 72000, players: 4 },
];

export const formatNaira = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG')}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
