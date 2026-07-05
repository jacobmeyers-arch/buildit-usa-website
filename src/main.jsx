import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Marketing site (public) — consolidated to 4 pages 2026-07-05; the old
// AI-for-Your-Work, Whole-Home Planner, and Property routes redirect into
// sections of /services.
import SiteLayout from './marketing/SiteLayout.jsx';
import Landing from './marketing/pages/Landing.jsx';
import About from './marketing/pages/About.jsx';
import Services from './marketing/pages/Services.jsx';
import Projects from './marketing/pages/Projects.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public marketing site */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/services" element={<Services />} />
            {/* Old paths → Services sections (keeps existing links/QR codes working) */}
            <Route path="/training" element={<Navigate to="/services" replace />} />
            <Route path="/ai-for-your-work" element={<Navigate to="/services" replace />} />
            <Route path="/whole-home-planner" element={<Navigate to="/services#planner" replace />} />
            <Route path="/property" element={<Navigate to="/services#property" replace />} />
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
