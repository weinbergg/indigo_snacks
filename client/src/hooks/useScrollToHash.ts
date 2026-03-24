import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      let attempts = 0;

      const scrollToTarget = () => {
        const target = document.querySelector(location.hash);

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }

        if (attempts < 12) {
          attempts += 1;
          window.setTimeout(scrollToTarget, 80);
        }
      };

      requestAnimationFrame(scrollToTarget);

      return;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.hash, location.pathname]);
}
