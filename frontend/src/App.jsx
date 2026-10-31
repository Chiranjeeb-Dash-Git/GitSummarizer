import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import SmoothScroll from './components/layout/SmoothScroll.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import RequireAuth from './components/layout/RequireAuth.jsx';
import RouteFallback from './components/layout/RouteFallback.jsx';
import GrainOverlay from './components/effects/GrainOverlay.jsx';
import StrataWipe from './components/effects/StrataWipe.jsx';
import ToastHost from './components/ui/ToastHost.jsx';
import CommandPalette from './components/command/CommandPalette.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Read = lazy(() => import('./pages/Read.jsx'));
const Summary = lazy(() => import('./pages/Summary.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <SmoothScroll>
      <a href="#main" className="skip-link">Skip to content</a>
      {!isHome && <GrainOverlay />}
      {!isHome && <Navbar />}
      <main id="main" tabIndex={-1} className="min-h-[70vh] outline-none">
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/read" element={<Read />} />
            <Route path="/r/:id" element={<Summary />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isHome && <Footer />}
      <StrataWipe />
      <ToastHost />
      <CommandPalette />
    </SmoothScroll>
  );
}
