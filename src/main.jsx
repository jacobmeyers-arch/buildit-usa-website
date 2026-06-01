import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Marketing site (public)
import SiteLayout from './marketing/SiteLayout.jsx';
import Landing from './marketing/pages/Landing.jsx';
import About from './marketing/pages/About.jsx';
import AIForWork from './marketing/pages/AIForWork.jsx';
import WholeHome from './marketing/pages/WholeHome.jsx';
import Services from './marketing/pages/Services.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public marketing site */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/ai-for-your-work" element={<AIForWork />} />
            <Route path="/whole-home-planner" element={<WholeHome />} />
            <Route path="/services" element={<Services />} />
            {/* Old path → Services (keeps existing links/QR codes working) */}
            <Route path="/training" element={<Navigate to="/services" replace />} />
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
