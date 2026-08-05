import { useEffect } from 'react';
import { ErrorBoundary } from '@/core/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { LoginScreen } from '@/features/auth/components/LoginScreen';

export const App = () => {
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Screen during initial session check
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
};

export default App;
