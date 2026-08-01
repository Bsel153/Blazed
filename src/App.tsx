import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import DealsPage from './pages/DealsPage';
import StrainDetailPage from './pages/StrainDetailPage';
import DispensaryDetailPage from './pages/DispensaryDetailPage';
import DashboardPage from './pages/DashboardPage';
import RewardsPage from './pages/RewardsPage';
import LoginPage from './pages/LoginPage';
import { LocationProvider } from './context/LocationContext';
import { LikesProvider } from './context/LikesContext';
import { PurchasesProvider } from './context/PurchasesContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" />;
  }
  if (!session) {
    return <LoginPage />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <LocationProvider>
          <LikesProvider>
            <PurchasesProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                  <NavBar />
                  <Routes>
                    <Route path="/" element={<Navigate to="/recreational" replace />} />
                    <Route path="/recreational" element={<DealsPage programType="recreational" />} />
                    <Route path="/medical" element={<DealsPage programType="medical" />} />
                    <Route path="/strain/:id" element={<StrainDetailPage />} />
                    <Route path="/dispensary/:id" element={<DispensaryDetailPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/rewards" element={<RewardsPage />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </PurchasesProvider>
          </LikesProvider>
        </LocationProvider>
      </AuthGate>
    </AuthProvider>
  );
}
