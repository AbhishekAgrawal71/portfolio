import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import PublicPortfolio from './PublicPortfolio';
import AdminRoute from './admin/AdminRoute';

// Helper component to handle #/admin hash fallback for static hosting
const RouteHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user accesses via hash like #/admin (useful on GitHub Pages)
    if (window.location.hash.startsWith('#/admin')) {
      navigate('/admin', { replace: true });
    }
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<PublicPortfolio />} />
      <Route path="/admin/*" element={<AdminRoute />} />
      {/* Fallback to public portfolio */}
      <Route path="*" element={<PublicPortfolio />} />
    </Routes>
  );
};

export function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <BrowserRouter>
          <RouteHandler />
        </BrowserRouter>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;
