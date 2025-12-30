/**
 * User Store - Manages user authentication and session
 * Local-only authentication with SHA-256 password hashing
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, generateId, hashPassword, verifyPassword } from '@/lib/db';
import type { User, UserSettings } from '@/lib/db';

export interface UserState {
  // Current user
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // All users (for user switching)
  users: User[];

  // Actions
  initialize: () => Promise<void>;
  loadUsers: () => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string, password: string) => Promise<boolean>;
  updateProfile: (displayName: string) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  clearError: () => void;
}

// Session storage key for remembering logged in user
const SESSION_KEY = 'neuromath_session';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      users: [],

      initialize: async () => {
        // Initialize is the same as loadUsers, but explicitly marks app as initialized
        await get().loadUsers();
      },

      loadUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const users = await db.users.toArray();
          set({ users, isLoading: false });

          // Try to restore session
          const sessionUserId = localStorage.getItem(SESSION_KEY);
          if (sessionUserId) {
            const user = users.find(u => u.id === sessionUserId);
            if (user) {
              set({ currentUser: user, isAuthenticated: true });
            }
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '사용자 목록을 불러오는데 실패했습니다.',
            isLoading: false,
          });
        }
      },

      register: async (username: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null });
        try {
          // Check if username already exists
          const existing = await db.users.where('username').equals(username.toLowerCase()).first();
          if (existing) {
            set({ error: '이미 사용 중인 사용자명입니다.', isLoading: false });
            return false;
          }

          // Validate inputs
          if (username.length < 2) {
            set({ error: '사용자명은 2자 이상이어야 합니다.', isLoading: false });
            return false;
          }
          if (password.length < 4) {
            set({ error: '비밀번호는 4자 이상이어야 합니다.', isLoading: false });
            return false;
          }

          const now = new Date();
          const passwordHash = await hashPassword(password);

          const newUser: User = {
            id: generateId(),
            username: username.toLowerCase(),
            displayName: displayName || username,
            passwordHash,
            createdAt: now,
            lastLoginAt: now,
          };

          await db.users.add(newUser);

          // Auto login after registration
          localStorage.setItem(SESSION_KEY, newUser.id);
          set({
            currentUser: newUser,
            isAuthenticated: true,
            users: [...get().users, newUser],
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
            isLoading: false,
          });
          return false;
        }
      },

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await db.users.where('username').equals(username.toLowerCase()).first();
          if (!user) {
            set({ error: '존재하지 않는 사용자입니다.', isLoading: false });
            return false;
          }

          // Check password (empty hash means no password required - guest/default user)
          if (user.passwordHash && !(await verifyPassword(password, user.passwordHash))) {
            set({ error: '비밀번호가 일치하지 않습니다.', isLoading: false });
            return false;
          }

          // Update last login time
          await db.users.update(user.id, { lastLoginAt: new Date() });
          const updatedUser = { ...user, lastLoginAt: new Date() };

          localStorage.setItem(SESSION_KEY, user.id);
          set({
            currentUser: updatedUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
            isLoading: false,
          });
          return false;
        }
      },

      loginAsGuest: async () => {
        set({ isLoading: true, error: null });
        try {
          // Check if default user exists
          let guestUser = await db.users.where('username').equals('default').first();

          if (!guestUser) {
            // Create default guest user
            const now = new Date();
            guestUser = {
              id: 'default-user',
              username: 'default',
              displayName: '게스트',
              passwordHash: '',
              createdAt: now,
              lastLoginAt: now,
            };
            await db.users.add(guestUser);
          }

          // Update last login time
          await db.users.update(guestUser.id, { lastLoginAt: new Date() });
          const updatedUser = { ...guestUser, lastLoginAt: new Date() };

          localStorage.setItem(SESSION_KEY, guestUser.id);
          set({
            currentUser: updatedUser,
            isAuthenticated: true,
            users: get().users.some(u => u.id === guestUser!.id)
              ? get().users
              : [...get().users, updatedUser],
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '게스트 로그인에 실패했습니다.',
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem(SESSION_KEY);
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
        });
      },

      switchUser: async (userId: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await db.users.get(userId);
          if (!user) {
            set({ error: '존재하지 않는 사용자입니다.', isLoading: false });
            return false;
          }

          // Check password
          if (user.passwordHash && !(await verifyPassword(password, user.passwordHash))) {
            set({ error: '비밀번호가 일치하지 않습니다.', isLoading: false });
            return false;
          }

          // Update last login time
          await db.users.update(user.id, { lastLoginAt: new Date() });
          const updatedUser = { ...user, lastLoginAt: new Date() };

          localStorage.setItem(SESSION_KEY, user.id);
          set({
            currentUser: updatedUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '사용자 전환에 실패했습니다.',
            isLoading: false,
          });
          return false;
        }
      },

      updateProfile: async (displayName: string) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          await db.users.update(currentUser.id, { displayName });
          set({
            currentUser: { ...currentUser, displayName },
            users: get().users.map(u =>
              u.id === currentUser.id ? { ...u, displayName } : u
            ),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.',
          });
        }
      },

      updateUserSettings: async (settings: Partial<UserSettings>) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          const newSettings = { ...currentUser.settings, ...settings };
          await db.users.update(currentUser.id, { settings: newSettings });
          set({
            currentUser: { ...currentUser, settings: newSettings },
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '설정 업데이트에 실패했습니다.',
          });
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        const { currentUser } = get();
        if (!currentUser) return false;

        set({ isLoading: true, error: null });
        try {
          // Verify old password (if exists)
          if (currentUser.passwordHash) {
            if (!(await verifyPassword(oldPassword, currentUser.passwordHash))) {
              set({ error: '현재 비밀번호가 일치하지 않습니다.', isLoading: false });
              return false;
            }
          }

          if (newPassword.length < 4) {
            set({ error: '새 비밀번호는 4자 이상이어야 합니다.', isLoading: false });
            return false;
          }

          const newHash = await hashPassword(newPassword);
          await db.users.update(currentUser.id, { passwordHash: newHash });

          set({
            currentUser: { ...currentUser, passwordHash: newHash },
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.',
            isLoading: false,
          });
          return false;
        }
      },

      deleteAccount: async (password: string) => {
        const { currentUser, logout } = get();
        if (!currentUser) return false;

        set({ isLoading: true, error: null });
        try {
          // Verify password
          if (currentUser.passwordHash) {
            if (!(await verifyPassword(password, currentUser.passwordHash))) {
              set({ error: '비밀번호가 일치하지 않습니다.', isLoading: false });
              return false;
            }
          }

          // Delete all user data
          await db.transaction('rw', [db.users, db.decks, db.cards, db.reviewLogs, db.settings], async () => {
            // Delete review logs
            await db.reviewLogs.where('userId').equals(currentUser.id).delete();
            // Delete cards
            await db.cards.where('userId').equals(currentUser.id).delete();
            // Delete decks
            await db.decks.where('userId').equals(currentUser.id).delete();
            // Delete settings
            await db.settings.where('userId').equals(currentUser.id).delete();
            // Delete user
            await db.users.delete(currentUser.id);
          });

          set({
            users: get().users.filter(u => u.id !== currentUser.id),
            isLoading: false,
          });

          logout();
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '계정 삭제에 실패했습니다.',
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'neuromath-user-store',
      partialize: (state) => ({
        // Only persist current user ID for session restoration
        // Actual user data is in IndexedDB
      }),
    }
  )
);

// Helper hook to get current user ID
export function useCurrentUserId(): string | null {
  return useUserStore(state => state.currentUser?.id ?? null);
}
