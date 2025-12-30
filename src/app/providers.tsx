'use client';

import { useEffect, type ReactNode } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { AuthScreen } from '@/components/AuthScreen';

export function Providers({ children }: { children: ReactNode }) {
  // User store
  const { currentUser, isAuthenticated, isLoading, loadUsers, initialize } = useUserStore();

  // Other stores
  const { setCurrentUserId: setDeckUserId, loadDecks, clearData: clearDeckData } = useDeckStore();
  const { setCurrentUserId: setSettingsUserId, loadSettings, resetSettings } = useSettingsStore();
  const { setCurrentUserId: setSessionUserId, clearSession } = useSessionStore();

  // Initialize user store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync user context across all stores when user changes
  useEffect(() => {
    const userId = currentUser?.id ?? null;

    // Update all stores with current user
    setDeckUserId(userId);
    setSettingsUserId(userId);
    setSessionUserId(userId);

    // Load user-specific data when authenticated
    if (userId) {
      loadSettings();
      loadDecks();
    } else {
      // Clear data when logged out
      clearDeckData();
      clearSession();
      resetSettings();
    }
  }, [
    currentUser?.id,
    setDeckUserId,
    setSettingsUserId,
    setSessionUserId,
    loadSettings,
    loadDecks,
    clearDeckData,
    clearSession,
    resetSettings,
  ]);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
