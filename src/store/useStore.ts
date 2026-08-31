import { create } from 'zustand';
import * as api from '../lib/api';

export type Task = {
  id: number;
  title: string;
  status: 'pending' | 'completed' | 'reviewed';
  assigned_by?: string;
  date_assigned: string;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
  streak: number;
  longest_streak: number;
  total_xp: number;
  learning_goal: string;
  weekly_score?: number;
  hours_studied_this_week?: number;
  tasks?: Task[];
};

export type Friend = User & {
  isOnline?: boolean;
};

type Store = {
  currentUser: User | null;
  token: string | null;
  friends: Friend[];
  notifications: string[];
  isInitializing: boolean;

  // Setters
  setCurrentUser: (user: User | null) => void;
  setFriends: (friends: Friend[]) => void;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  addFriend: (friendEmail: string) => Promise<void>;
  removeFriend: (id: number) => Promise<void>;
  assignTask: (userId: number, title: string) => Promise<void>;
  reviewTask: (userId: number, taskId: number) => Promise<void>;
  rejectTask: (userId: number, taskId: number) => Promise<void>;
  completeTask: (taskId: number) => Promise<void>;
  fetchFriends: () => Promise<void>;
};

export const useStore = create<Store>((set, get) => ({
  currentUser: null,
  token: null,
  friends: [],
  notifications: [],
  isInitializing: true,

  setCurrentUser: (user) => set({ currentUser: user }),
  setFriends: (friends) => set({ friends }),

  login: async (email, password) => {
    const data = await api.login(email, password);
    // data = { access_token, token_type, user }
    if (typeof window !== 'undefined') {
      localStorage.setItem('ll_token', data.access_token);
    }
    set({ currentUser: data.user, token: data.access_token });
    get().fetchFriends();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ll_token');
    }
    set({ currentUser: null, friends: [], token: null });
  },

  initAuth: async () => {
    set({ isInitializing: true });
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const token = typeof window !== 'undefined' ? localStorage.getItem('ll_token') : null;
    
    if (token) {
      try {
        const user = await api.getMe();
        set({ currentUser: user, token });
        get().fetchFriends();
        set({ isInitializing: false });
        return;
      } catch (err) {
        if (typeof window !== 'undefined') localStorage.removeItem('ll_token');
      }
    }

    if (isLocalhost) {
      try {
        const user = await api.getMe();
        set({ currentUser: user, token: 'local-dev-token' });
        get().fetchFriends();
      } catch {
        // Fallback default dev user if backend is offline
        const localDevUser: User = {
          id: 1,
          name: "Local Admin",
          username: "admin",
          email: "admin@learnleague.local",
          role: "admin",
          streak: 7,
          longest_streak: 14,
          total_xp: 2450,
          learning_goal: "AI & Full-Stack Development",
          weekly_score: 95,
          hours_studied_this_week: 18,
          tasks: [],
        };
        set({ currentUser: localDevUser, token: 'local-dev-token' });
      }
      set({ isInitializing: false });
      return;
    }

    set({ currentUser: null, token: null, isInitializing: false });
  },

  fetchFriends: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    // Fetch all users (leaderboard) so they appear on the Friends page
    const friends = await api.getLeaderboard();
    set({ friends });
  },

  addFriend: async (friendEmail) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.addFriend(currentUser.id, friendEmail);
    get().fetchFriends();
  },

  removeFriend: async (id) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.removeFriend(currentUser.id, id);
    get().fetchFriends();
  },

  assignTask: async (userId, title) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.assignTask(userId, { title, assigned_by: currentUser.name });

    if (userId === currentUser.id) {
      const refreshedUser = await api.getMe();
      set({ currentUser: refreshedUser });
    } else {
      get().fetchFriends();
    }
  },

  reviewTask: async (userId, taskId) => {
    await api.reviewTask(taskId);
    get().fetchFriends();
    const { currentUser } = get();
    if (currentUser && userId === currentUser.id) {
      const refreshedUser = await api.getMe();
      set({ currentUser: refreshedUser });
    }
  },

  rejectTask: async (userId, taskId) => {
    await api.rejectTask(taskId);
    get().fetchFriends();
    const { currentUser } = get();
    if (currentUser && userId === currentUser.id) {
      const refreshedUser = await api.getMe();
      set({ currentUser: refreshedUser });
    }
  },

  completeTask: async (taskId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.completeTask(taskId);
    const refreshedUser = await api.getMe();
    set({ currentUser: refreshedUser });
  }
}));
