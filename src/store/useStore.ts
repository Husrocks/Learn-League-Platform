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
  friends: Friend[];
  notifications: string[];
  
  // Setters
  setCurrentUser: (user: User | null) => void;
  setFriends: (friends: Friend[]) => void;
  
  // Actions
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  addFriend: (friendEmail: string) => Promise<void>;
  removeFriend: (id: number) => Promise<void>;
  assignTask: (userId: number, title: string) => Promise<void>;
  reviewTask: (userId: number, taskId: number) => Promise<void>;
  completeTask: (taskId: number) => Promise<void>;
  fetchFriends: () => Promise<void>;
};

export const useStore = create<Store>((set, get) => ({
  currentUser: null,
  friends: [],
  notifications: [],
  
  setCurrentUser: (user) => set({ currentUser: user }),
  setFriends: (friends) => set({ friends }),

  login: async (email, password) => {
    const user = await api.login(email, password);
    set({ currentUser: user });
    if (user.id) {
      get().fetchFriends();
    }
  },
  
  logout: () => set({ currentUser: null, friends: [] }),
  
  fetchFriends: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    const friends = await api.getFriends(currentUser.id);
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
    
    // Refresh data
    if (userId === currentUser.id) {
      const refreshedUser = await api.getMe(currentUser.id);
      set({ currentUser: refreshedUser });
    } else {
      get().fetchFriends();
    }
  },
  
  reviewTask: async (userId, taskId) => {
    await api.reviewTask(taskId);
    get().fetchFriends();
  },
  
  completeTask: async (taskId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    await api.completeTask(taskId);
    
    const refreshedUser = await api.getMe(currentUser.id);
    set({ currentUser: refreshedUser });
  }
}));
