import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Marketing site (public) — cut to 2 pages 2026-07-31, then /pricing restored
// as a standalone payment page the same day. /about stays folded into home;
// every retired route redirects so existing links and QR codes keep working.
import SiteLayout from './marketing/SiteLayout.jsx';
import Landing from './marketing/pages/Landing.jsx';
import Pricing from './marketing/pages/Pricing.jsx';
import Projects from './marketing/pages/Projects.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public marketing site */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/projects" element={<Projects />} />

            {/* Retired pages. Everything that used to sell something lands on
                /pricing; QR codes and old links depend on these staying. */}
            <Route path="/services" element={<Navigate to="/pricing" replace />} />
            <Route path="/training" element={<Navigate to="/pricing" replace />} />
            <Route path="/ai-for-your-work" element={<Navigate to="/pricing" replace />} />
            <Route path="/whole-home-planner" element={<Navigate to="/pricing" replace />} />
            <Route path="/property" element={<Navigate to="/pricing" replace />} />
            <Route path="/about" element={<Navigate to="/" replace />} />
          </Route>

          {/* Estimation tool parked — not deployed for now (see .vercelignore).
              To restore: re-add the App import + ProjectProvider and an /app route. */}

          {/* Unknown paths fall back to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
