import { create } from 'zustand';
import * as api from '../lib/api';
import { AUTH_EXPIRED_EVENT } from '../lib/api';

export type Task = {
  id: number;
  title: string;
  status: 'pending' | 'completed' | 'reviewed' | 'rejected';
  assigned_by?: string;
  date_assigned: string;
};

export type LearningLog = {
  id: number;
  date: string;
  hours_studied: number;
  topics: string;
  reflection: string;
  xp_earned?: number;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
  last_seen?: string;
  streak: number;
  longest_streak: number;
  total_xp: number;
  totalXp?: number;
  learning_goal: string;
  weekly_score?: number;
  hours_studied_this_week?: number;
  tasks?: Task[];
  logs?: LearningLog[];
};

export type Friend = User & {
  isOnline?: boolean;
  logs?: LearningLog[];
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
  logDailyLearning: (hours: number, topics: string, reflection: string, completedTaskIds?: number[]) => Promise<{ success: boolean; warning?: string }>;
  fetchLeaderboardAsNetwork: () => Promise<void>;
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
    get().fetchLeaderboardAsNetwork();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ll_token');
    }
    set({ currentUser: null, friends: [], token: null });
  },

  initAuth: async () => {
    set({ isInitializing: true });
    const token = typeof window !== 'undefined' ? localStorage.getItem('ll_token') : null;
    
    if (token) {
      try {
        const user = await api.getMe();
        set({ currentUser: user, token, isInitializing: false });
        get().fetchLeaderboardAsNetwork();
        return;
      } catch {
        if (typeof window !== 'undefined') localStorage.removeItem('ll_token');
      }
    }

    set({ currentUser: null, token: null, isInitializing: false });
  },

  fetchLeaderboardAsNetwork: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      const friends = await api.getLeaderboard();
      set({ friends });
    } catch (err) {
      console.warn("[LearnLeague] Could not refresh network/leaderboard:", err);
    }
  },

  addFriend: async (friendEmail) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.addFriend(currentUser.id, friendEmail);
    get().fetchLeaderboardAsNetwork();
  },

  removeFriend: async (id) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.removeFriend(currentUser.id, id);
    get().fetchLeaderboardAsNetwork();
  },

  assignTask: async (userId, title) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.assignTask(userId, { title, assigned_by: currentUser.name });

    if (userId === currentUser.id) {
      const refreshedUser = await api.getMe();
      set({ currentUser: refreshedUser });
    } else {
      get().fetchLeaderboardAsNetwork();
    }
  },

  reviewTask: async (userId, taskId) => {
    await api.reviewTask(taskId);
    get().fetchLeaderboardAsNetwork();
    const { currentUser } = get();
    if (currentUser && userId === currentUser.id) {
      const refreshedUser = await api.getMe();
      set({ currentUser: refreshedUser });
    }
  },

  rejectTask: async (userId, taskId) => {
    await api.rejectTask(taskId);
    get().fetchLeaderboardAsNetwork();
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
  },

  /**
   * Atomic Daily Learning & Task Completion Submission
   * 
   * Transmits study hours, topics, reflection, and completed task IDs in a single
   * transactional POST payload to `/learning/{userId}/log`.
   * If post succeeds but subsequent `getMe()` user refresh fails, returns `warning` instead
   * of throwing an unhandled exception, ensuring submission is marked as successful.
   */
  logDailyLearning: async (hours, topics, reflection, completedTaskIds = []) => {
    const { currentUser } = get();
    if (!currentUser) return { success: false, warning: "User session not found." };

    // Transactional POST request to backend containing task_ids
    await api.logDailyLearning(currentUser.id, hours, topics, reflection, [], completedTaskIds);

    // Refresh profile state post-submission
    try {
      const refreshedUser = await api.getMe();
      set({ currentUser: refreshedUser });
      return { success: true };
    } catch (refreshErr) {
      console.warn("[LearnLeague] Learning log saved, but failed to refresh user profile:", refreshErr);
      return {
        success: true,
        warning: "Your learning log was saved successfully, but updating your dashboard view failed. Please reload the page."
      };
    }
  }
}));

// Decoupled listener for expired session 401 events
if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_EXPIRED_EVENT, () => {
    useStore.getState().logout();
  });
}
