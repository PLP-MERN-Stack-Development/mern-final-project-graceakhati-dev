import { create } from 'zustand';

/**
 * UI Store State
 */
interface UIStore {
  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Notification state
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    timestamp: number;
  }>;
  addNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

/**
 * Zustand store for UI state management
 *
 * Manages sidebar, theme, loading states, and notifications.
 *
 * @example
 * ```tsx
 * const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();
 *
 * // Toggle sidebar
 * toggleSidebar();
 *
 * // Change theme
 * toggleTheme();
 * ```
 */
export const useUIStore = create<UIStore>((set, get) => ({
  // Sidebar state
  sidebarOpen: false,
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  // Theme state
  theme: 'light',
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    }));
    // Persist theme preference
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('planet-path-theme', newTheme);
  },
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('planet-path-theme', theme);
  },

  // Loading state
  isLoading: false,
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Notification state
  notifications: [],
  addNotification: (message, type = 'info') => {
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: Date.now(),
    };
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(notification.id);
    }, 5000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Load theme from localStorage on initialization
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('planet-path-theme') as 'light' | 'dark' | null;
  if (savedTheme) {
    useUIStore.getState().setTheme(savedTheme);
  }
}

