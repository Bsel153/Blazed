import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import DealsPage from './pages/DealsPage';
import StrainDetailPage from './pages/StrainDetailPage';
import DispensaryDetailPage from './pages/DispensaryDetailPage';
import DashboardPage from './pages/DashboardPage';
import { LocationProvider } from './context/LocationContext';
import { LikesProvider } from './context/LikesContext';

export default function App() {
  return (
    <LocationProvider>
      <LikesProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <NavBar />
            <Routes>
              <Route path="/" element={<Navigate to="/recreational" replace />} />
              <Route path="/recreational" element={<DealsPage programType="recreational" />} />
              <Route path="/medical" element={<DealsPage programType="medical" />} />
              <Route path="/strain/:id" element={<StrainDetailPage />} />
              <Route path="/dispensary/:id" element={<DispensaryDetailPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </LikesProvider>
    </LocationProvider>
  );
}
