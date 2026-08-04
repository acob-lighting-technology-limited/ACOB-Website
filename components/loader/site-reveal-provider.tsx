'use client';

import dynamic from 'next/dynamic';
import { isAnniversaryYear2026 } from '@/lib/constants/anniversary';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Loaded client-only, with no SSR fallback.
 *
 * The overlay ('use client') would otherwise still be rendered into the
 * initial server HTML. Framer Motion's `initial` styles are only applied once
 * JS hydrates, so that server markup paints as fully-formed text — visible for
 * one frame before hydration snaps it back to its starting state and the
 * intro plays. Excluding it from SSR means it doesn't exist in the DOM at all
 * until React mounts it client-side, so there's nothing to flash.
 */
const AcobLoaderOverlay = dynamic(() => import('./acob-loader-overlay'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[99999] bg-[hsl(var(--loader-surface))]" />
  ),
});

/**
 * Coordinates the intro loader with the page underneath it.
 *
 * The overlay owns its own lifetime: it loops the ACOB wordmark until the page
 * has actually finished loading, then plays the curtain lift. `revealed` flips
 * a beat *before* the curtain has fully cleared, so the header and hero are
 * already moving as the panel rises — the two read as one motion instead of
 * two separate events.
 */

type SiteRevealValue = {
  /** True once the curtain is on its way up (or if the loader never ran). */
  revealed: boolean;
  /** Staggered delay in seconds for content entering behind the curtain. */
  revealDelay: (step?: number) => number;
};

const SiteRevealContext = createContext<SiteRevealValue>({
  revealed: true,
  revealDelay: () => 0,
});

/**
 * Content that has no provider above it (bare routes, Studio) must not sit
 * there invisible waiting for a reveal that never comes — hence the `true`
 * default above.
 */
export function useSiteReveal() {
  return useContext(SiteRevealContext);
}

/** Head start the content gets on the rising curtain. */
const REVEAL_LEAD = 0.35;
/** Spacing between staggered elements once the reveal fires. */
const REVEAL_STEP = 0.09;
/** Never hold the loader longer than this, whatever the network is doing. */
const MAX_LOADER_MS = 12000;

const SESSION_KEY = 'acob-intro-shown';

/**
 * The intro is a first-impression moment, not a toll booth. Showing it on
 * every reload is the part that reads as dated, so it runs once per browsing
 * session — reloads and return visits within the session go straight to the
 * page.
 *
 * Read during the initial render (not in an effect) so a repeat load never
 * mounts the overlay at all, rather than flashing a panel for a frame.
 */
function introAlreadyShown(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    // Private mode / storage disabled — treat as unseen rather than break.
    return false;
  }
}

function markIntroShown(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* nothing to do — the intro simply repeats next load */
  }
}

export default function SiteRevealProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const seenThisSession = introAlreadyShown();

  const [showLoader, setShowLoader] = useState(!seenThisSession);
  const [revealed, setRevealed] = useState(seenThisSession);
  const [pageReady, setPageReady] = useState(false);

  /* Skip the whole thing for reduced-motion users. */
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (query.matches) {
      setShowLoader(false);
      setRevealed(true);
    }
  }, []);

  /* Claim the session slot as soon as the intro actually runs. */
  useEffect(() => {
    if (showLoader) {
      markIntroShown();
    }
  }, [showLoader]);

  /* Readiness: real load event, with a hard ceiling as a safety net. */
  useEffect(() => {
    if (document.readyState === 'complete') {
      setPageReady(true);
      return;
    }

    const onLoad = () => setPageReady(true);
    window.addEventListener('load', onLoad);
    const cap = setTimeout(() => setPageReady(true), MAX_LOADER_MS);

    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(cap);
    };
  }, []);

  /* Hold the page still until the overlay is completely gone. */
  useEffect(() => {
    if (!showLoader) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [showLoader]);

  /*
   * Freeze the page's own CSS entrance animations until the reveal — not until
   * the overlay unmounts. They need to start *with* the rising curtain, the
   * same beat the header and hero text move on; waiting for the overlay to
   * finish would leave the page a step behind its own reveal.
   */
  useEffect(() => {
    if (revealed) {
      document.documentElement.removeAttribute('data-loader-active');
      return;
    }

    document.documentElement.setAttribute('data-loader-active', '');
    return () => document.documentElement.removeAttribute('data-loader-active');
  }, [revealed]);

  /** Fired by the overlay the moment the curtain starts rising. */
  const handleExitStart = useCallback(() => {
    setTimeout(() => setRevealed(true), REVEAL_LEAD * 1000);
  }, []);

  const handleFinished = useCallback(() => {
    setShowLoader(false);
    setRevealed(true);
  }, []);

  const value = useMemo<SiteRevealValue>(
    () => ({
      revealed,
      revealDelay: (step = 0) => (revealed ? step * REVEAL_STEP : 0),
    }),
    [revealed],
  );

  return (
    <SiteRevealContext.Provider value={value}>
      {children}
      {showLoader && (
        <AcobLoaderOverlay
          exit="curtain"
          ready={pageReady}
          loop
          showAnniversary={isAnniversaryYear2026()}
          onExitStart={handleExitStart}
          onFinished={handleFinished}
        />
      )}
    </SiteRevealContext.Provider>
  );
}
