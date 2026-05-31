/**
 * SiteLayout.jsx — Shell for all marketing pages
 * Created: 2026-05-31
 *
 * Renders the sticky Nav, the routed page via <Outlet/>, and the Footer.
 * Scrolls to top on every route change.
 */
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function SiteLayout() {
  return (
    <div className="bg-workshop min-h-screen flex flex-col">
      <ScrollToTop />
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
