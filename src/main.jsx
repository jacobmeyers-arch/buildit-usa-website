import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Marketing site (public) — cut to 2 pages 2026-07-31. /services and /about
// were absorbed into the home page; every retired route redirects there so
// existing links, QR codes, and search results keep working.
import SiteLayout from './marketing/SiteLayout.jsx';
import Landing from './marketing/pages/Landing.jsx';
import Projects from './marketing/pages/Projects.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public marketing site */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/projects" element={<Projects />} />

            {/* Retired pages → home. The #pricing anchor replaces what used to
                be the /services sections; QR codes depend on these staying. */}
            <Route path="/services" element={<Navigate to="/#pricing" replace />} />
            <Route path="/about" element={<Navigate to="/" replace />} />
            <Route path="/training" element={<Navigate to="/#pricing" replace />} />
            <Route path="/ai-for-your-work" element={<Navigate to="/#pricing" replace />} />
            <Route path="/whole-home-planner" element={<Navigate to="/#pricing" replace />} />
            <Route path="/property" element={<Navigate to="/#pricing" replace />} />
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
