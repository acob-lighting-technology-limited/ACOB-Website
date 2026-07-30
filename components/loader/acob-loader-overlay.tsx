'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import AcobWordmarkLoader, {
  LOADER_EXITS,
  type LoaderExit,
  type LoaderTempo,
} from './acob-wordmark-loader';

type Props = {
  /** Which exit animation plays once the page is ready. */
  exit?: LoaderExit;
  /** Flip to true when the page has finished loading. */
  ready?: boolean;
  /** Replay the intro if the page still isn't ready when a pass ends. */
  loop?: boolean;
  /** Fires the moment the exit animation begins. */
  onExitStart?: () => void;
  /** Fires after the exit animation has fully played out. */
  onFinished?: () => void;
  /** Reveal the gold "@10" anniversary mark beside Technology. */
  showAnniversary?: boolean;
  /** Pacing preset. 'tight' ships; 'full' is the original, for comparison. */
  tempo?: LoaderTempo;
};

const PANEL_CLASS =
  'fixed inset-0 z-[99999] overflow-hidden bg-[hsl(var(--loader-surface))]';

/**
 * Full-screen loader overlay.
 *
 * The intro runs on its own clock. When a pass ends it either exits (page is
 * ready) or starts over (page still loading) — so the loader never cuts off
 * mid-sequence and never leaves the user staring at a frozen wordmark.
 */
export default function AcobLoaderOverlay({
  exit = 'curtain',
  ready = true,
  loop = true,
  onExitStart,
  onFinished,
  showAnniversary = false,
  tempo = 'tight',
}: Props) {
  const def = LOADER_EXITS[exit];

  const [visible, setVisible] = useState(true);
  const [runId, setRunId] = useState(0);
  const [passDone, setPassDone] = useState(false);

  const handlePassComplete = useCallback(() => setPassDone(true), []);

  useEffect(() => {
    if (!passDone) {
      return;
    }

    if (ready) {
      setVisible(false);
      onExitStart?.();
      return;
    }

    if (loop) {
      setPassDone(false);
      setRunId(id => id + 1);
    }
  }, [passDone, ready, loop, onExitStart]);

  const content = (withCallback: boolean) => (
    <AcobWordmarkLoader
      key={runId}
      onComplete={withCallback ? handlePassComplete : undefined}
      showAnniversary={showAnniversary}
      tempo={tempo}
      wordmarkVariants={def.wordmark}
    />
  );

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {visible &&
        (def.halves
          ? [
              // Two stacked copies of the same panel, each clipped to one half
              // and leaving in the opposite direction.
              <motion.div
                key="half-top"
                className={PANEL_CLASS}
                style={{ clipPath: 'inset(0% 0% 50% 0%)' }}
                exit={{
                  y: '-100%',
                  transition: {
                    duration: def.duration,
                    ease: [0.83, 0, 0.17, 1],
                  },
                }}
              >
                {content(true)}
              </motion.div>,
              <motion.div
                key="half-bottom"
                className={PANEL_CLASS}
                style={{ clipPath: 'inset(50% 0% 0% 0%)' }}
                exit={{
                  y: '100%',
                  transition: {
                    duration: def.duration,
                    ease: [0.83, 0, 0.17, 1],
                  },
                }}
              >
                {content(false)}
              </motion.div>,
            ]
          : [
              <motion.div
                key="panel"
                className={PANEL_CLASS}
                style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                variants={def.panel}
                initial={false}
                exit="exit"
              >
                {content(true)}
              </motion.div>,
            ])}
    </AnimatePresence>
  );
}
