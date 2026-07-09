import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// ========================
// AUTH STORE
// ========================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('whotnaija_token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('whotnaija_token');
          delete api.defaults.headers.common['Authorization'];
        }
      },

      login: async (identifier, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { identifier, password });
          get().setToken(data.token);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', formData);
          get().setToken(data.token);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          const errors = err.response?.data?.errors;
          return {
            success: false,
            message: errors ? errors[0]?.msg : (err.response?.data?.message || 'Registration failed'),
            errors,
          };
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        get().setToken(null);
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {}
      },

      updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'whotnaija-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ========================
// WALLET STORE
// ========================
export const useWalletStore = create((set) => ({
  balance: 0,
  bonusBalance: 0,
  totalBalance: 0,
  hasDeposited: false,
  transactions: [],
  isLoading: false,

  fetchBalance: async () => {
    try {
      const { data } = await api.get('/wallet/balance');
      set({
        balance: data.balance,
        bonusBalance: data.bonusBalance,
        totalBalance: data.totalBalance,
        hasDeposited: data.hasDeposited,
      });
    } catch {}
  },

  fetchTransactions: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/wallet/transactions?page=${page}&limit=20`);
      set({ transactions: data.transactions, isLoading: false });
      return data;
    } catch {
      set({ isLoading: false });
    }
  },
}));

// ========================
// GAME STORE
// ========================
export const useGameStore = create((set, get) => ({
  currentRoom: null,
  gameState: null,
  myHand: [],
  isMyTurn: false,
  matchmaking: { active: false, status: 'idle', stakeAmount: null, roomType: null },
  gameResult: null,
  voiceAnnouncement: null,
  emojiReactions: [],
  pendingPickCount: 0,

  setCurrentRoom: (room) => set({ currentRoom: room }),
  setGameState: (gameState) => set({ gameState }),
  setMyHand: (hand) => set({ myHand: hand }),
  setIsMyTurn: (v) => set({ isMyTurn: v }),

  setMatchmaking: (data) => set(state => ({ matchmaking: { ...state.matchmaking, ...data } })),

  setGameResult: (result) => set({ gameResult: result }),
  clearGameResult: () => set({ gameResult: null }),

  showVoiceAnnouncement: (text) => {
    set({ voiceAnnouncement: text });
    setTimeout(() => set({ voiceAnnouncement: null }), 2500);
  },

  addEmojiReaction: (reaction) => {
    const id = Date.now() + Math.random();
    set(state => ({ emojiReactions: [...state.emojiReactions, { ...reaction, id }] }));
    setTimeout(() => {
      set(state => ({ emojiReactions: state.emojiReactions.filter(r => r.id !== id) }));
    }, 2200);
  },

  resetGame: () => set({
    currentRoom: null,
    gameState: null,
    myHand: [],
    isMyTurn: false,
    matchmaking: { active: false, status: 'idle', stakeAmount: null, roomType: null },
    gameResult: null,
    voiceAnnouncement: null,
    emojiReactions: [],
    pendingPickCount: 0,
  }),
}));

// ========================
// UI STORE
// ========================
export const useUIStore = create((set) => ({
  sidebarOpen: false,
  theme: 'dark',
  onlineCount: 0,

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setOnlineCount: (n) => set({ onlineCount: n }),
}));
