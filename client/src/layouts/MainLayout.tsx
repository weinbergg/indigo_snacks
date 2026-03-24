import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { PageLoader } from '../components/PageLoader';
import { useScrollToHash } from '../hooks/useScrollToHash';

export function MainLayout() {
  useScrollToHash();

  return (
    <div className="min-h-screen bg-glow">
      <Header />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
