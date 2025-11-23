import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Simulator } from './pages/Simulator';
import { History } from './pages/History';
import { Preferences } from './pages/Preferences';
import { WelcomeAnimation } from './components/WelcomeAnimation';
import { ResetModal } from './components/ResetModal';
import { SuccessModal } from './components/SuccessModal';
import { resetAllData } from './services/firestoreService';
import { CacheService } from './services/cacheService';
import { BILLING_CONSTANTS } from './config/billingConstants';

function AppContent() {
  const location = useLocation();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const isDashboard = location.pathname === '/';

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const handleResetConfirm = async () => {
    try {
      await resetAllData();
      CacheService.clearAll();
      setIsResetModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error resetting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to reset data: ${errorMessage}. Please check your connection and try again.`);
      setIsResetModalOpen(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    window.location.reload();
  };

  const resetButton = isDashboard ? (
    <button
      onClick={handleResetClick}
      className="w-full px-3 lg-plus:px-4 py-2 lg-plus:py-2.5 text-xs lg-plus:text-sm bg-cream-100 dark:bg-matcha-900 text-matcha-800 dark:text-cream-200 rounded-lg hover:bg-cream-200 dark:hover:bg-matcha-700 transition-colors font-medium border border-matcha-300 dark:border-matcha-600 flex items-center justify-center gap-1.5 lg-plus:gap-2"
      title="Reset all data"
    >
      <span className="text-base lg-plus:text-lg">🔄</span>
      <span>Reset Data</span>
    </button>
  ) : null;

  return (
    <>
      <Layout resetButton={resetButton}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/history" element={<History />} />
          <Route path="/preferences" element={<Preferences />} />
        </Routes>
      </Layout>

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="Success!"
        message="All data has been reset successfully."
        onClose={handleSuccessModalClose}
      />
    </>
  );
}

function App() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if welcome screen has been shown in this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    sessionStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        {showWelcome && <WelcomeAnimation onComplete={handleWelcomeComplete} />}
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
