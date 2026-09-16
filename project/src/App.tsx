import { useState } from 'react';
import type { User, VerificationRecord, View } from '@/types';
import Navbar from '@/components/Navbar';
import AuthPortal from '@/components/AuthPortal';
import Dashboard from '@/components/Dashboard';
import UploadView from '@/components/UploadView';
import ReportView from '@/components/ReportView';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('auth');
  const [currentRecord, setCurrentRecord] = useState<VerificationRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAuth = (u: User) => {
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRecord(null);
    setView('auth');
  };

  const handleViewReport = (record: VerificationRecord) => {
    setCurrentRecord(record);
    setView('report');
  };

  const handleVerifyResult = (record: VerificationRecord) => {
    setCurrentRecord(record);
    setView('report');
    setRefreshKey((k) => k + 1);
  };

  const handleBackToDashboard = () => {
    setCurrentRecord(null);
    setView('dashboard');
    setRefreshKey((k) => k + 1);
  };

  if (!user || view === 'auth') {
    return <AuthPortal onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} view={view} onNavigate={setView} onLogout={handleLogout} />
      <main>
        {view === 'dashboard' && (
          <Dashboard
            user={user}
            onViewReport={handleViewReport}
            onNavigateUpload={() => setView('upload')}
            refreshKey={refreshKey}
          />
        )}
        {view === 'upload' && (
          <UploadView user={user} onResult={handleVerifyResult} />
        )}
        {view === 'report' && currentRecord && (
          <ReportView record={currentRecord} onBack={handleBackToDashboard} />
        )}
      </main>
    </div>
  );
}

export default App;
