import { useState } from 'react';
import DriverApp from './desktop/App';
import TransporterApp from './transporter/App';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SyncProvider } from './hooks/SyncContext';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
type AppMode = 'driver' | 'transporter';
type AuthPage = 'login' | 'signup';

function AuthenticatedApp() {
  const [mode, setMode] = useState<AppMode>('driver');

  return (
    <SyncProvider>
      {mode === 'transporter'
        ? <TransporterApp onSwitchToDriver={() => setMode('driver')} />
        : <DriverApp onSwitchToTransporter={() => setMode('transporter')} />
      }
    </SyncProvider>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Loading TransportOps…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authPage === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthPage('signup')} />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

