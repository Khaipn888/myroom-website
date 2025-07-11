// store/userStore.ts
import { create } from 'zustand';

interface UserState {
  user: {
    _id: string;
    name: string;
    email?: string;
    role: string;
    avatar?: string;
    code?: string;
    phone?: string;
    address?: string;
    savedPosts?: string[];
    numberOfPost?: number;
    numberOfPostRented?: number;
  } | null;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user:any) => set({ user }),
  logout: () => set({ user: null }),
}));
