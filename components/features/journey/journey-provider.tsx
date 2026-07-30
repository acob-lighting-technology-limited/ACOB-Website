'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { JourneyExperience } from '@/components/sections/journey-experience';

/**
 * Renders The Journey as a full-screen OVERLAY instead of a route, so closing
 * it simply unmounts and reveals the page underneath — no navigation, no
 * reload. Any in-app link to `/journey` is intercepted and opens the overlay;
 * the real `/journey` route stays as a fallback for direct visits / shares.
 */
export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Intercept clicks on any <a href="/journey"> and open the overlay instead.
  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement)?.closest?.('a');
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute('href');
      if (href === '/journey') {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Escape closes the overlay.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="journey-overlay"
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <JourneyExperience onClose={close} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
