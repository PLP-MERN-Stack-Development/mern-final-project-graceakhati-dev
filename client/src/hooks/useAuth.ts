/**
 * useAuth Hook
 * 
 * Re-export of the useAuth hook from AuthContext for convenience.
 * This allows components to import useAuth from hooks/useAuth.ts
 * instead of context/AuthContext.tsx
 * 
 * Usage:
 * ```typescript
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm />;
 *   }
 *   
 *   return <div>Welcome, {user?.name}!</div>;
 * }
 * ```
 */

export { useAuth } from '../context/AuthContext';
export type {
  AuthUser,
  AuthContextType,
  UserRole,
  LoginCredentials,
} from '../context/AuthContext';

