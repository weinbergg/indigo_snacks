import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { PageLoader } from '../components/PageLoader';
import { useScrollToHash } from '../hooks/useScrollToHash';

export function MainLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  useScrollToHash();

  return (
    <div className="min-h-screen bg-glow">
      <Header />
      <motion.main
        key={location.pathname}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </motion.main>
      <Footer />
    </div>
  );
}
