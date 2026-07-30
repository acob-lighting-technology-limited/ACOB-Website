'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';

/**
 * ACOB Wordmark Loader
 *
 * Sequence:
 *  1. "A" sits centered on the stage.
 *  2. C, O then B swing out from behind the letter before them to form ACOB.
 *  3. LIGHTING unfolds the same way, letter by letter, out of the B.
 *  4. TECHNOLOGY slides down from underneath the ACOB LIGHTING line.
 */

const BRAND = 'ACOB';
const LIGHTING = 'LIGHTING';
/** Gap between ACOB and LIGHTING, in em — a real space glyph collapses to
 * zero width because it's the sole content of an inline-block box (leading/
 * trailing whitespace inside that box gets trimmed), so the gap is a sized
 * spacer instead. */
const WORD_GAP_EM = 0.32;

/**
 * Optical correction for the "@". Its bowl is drawn extending below the
 * baseline in most sans faces, while the lining digits beside it sit exactly
 * on it — so baseline-aligned, the "@" reads as sagging. Nudge it back up.
 */
const AT_RISE_EM = 0.09;

/* ------------------------------------------------------------------ */
/* Timeline (seconds)                                                  */
/* ------------------------------------------------------------------ */

type TimelineInput = {
  /** When the lone "A" lands. */
  aStart: number;
  /** When "C" starts; O and B follow on the stagger. */
  brandStart: number;
  brandStagger: number;
  /** How long one letter takes to swing out. */
  letterDuration: number;
  /** Gap after the last brand letter before LIGHTING begins. */
  lightingLead: number;
  lightingStagger: number;
  /** Gap after LIGHTING lands before TECHNOLOGY drops. */
  techLead: number;
  techDuration: number;
  /**
   * Beat after TECHNOLOGY lands before "@10" swings out. It waits for a
   * settled word — starting mid-slide made it ride down into place instead of
   * emerging from a stationary neighbour like every other letter.
   */
  anniversaryBeat: number;
  /** Beat to rest on the finished mark before the curtain takes it. */
  restBeat: number;
};

function buildTimeline(i: TimelineInput) {
  const lightingStart =
    i.brandStart + i.brandStagger * (BRAND.length - 1) + i.lightingLead;
  const techStart =
    lightingStart + i.lightingStagger * (LIGHTING.length - 1) + i.techLead;
  const anniversaryStart = techStart + i.techDuration + i.anniversaryBeat;

  return {
    ...i,
    lightingStart,
    techStart,
    anniversaryStart,
    /** One full pass. */
    duration: techStart + i.techDuration + i.restBeat,
    /** One full pass that also reveals "@10". */
    durationAnniversary: anniversaryStart + i.letterDuration + i.restBeat,
  };
}

export type LoaderTempo = 'tight' | 'full';

export const LOADER_TIMELINES: Record<
  LoaderTempo,
  ReturnType<typeof buildTimeline>
> = {
  /**
   * Ships to the site. Same choreography, roughly half the wall time — an
   * intro that gates every session should be over in a couple of seconds.
   */
  tight: buildTimeline({
    aStart: 0.08,
    brandStart: 0.32,
    brandStagger: 0.15,
    letterDuration: 0.4,
    lightingLead: 0.24,
    lightingStagger: 0.05,
    techLead: 0.16,
    techDuration: 0.42,
    anniversaryBeat: 0.06,
    restBeat: 0.18,
  }),

  /** The original, slower pacing — kept for comparison in /try. */
  full: buildTimeline({
    aStart: 0.15,
    brandStart: 0.7,
    brandStagger: 0.32,
    letterDuration: 0.62,
    lightingLead: 0.372,
    lightingStagger: 0.105,
    techLead: 0.35,
    techDuration: 0.75,
    anniversaryBeat: 0.12,
    restBeat: 0.4,
  }),
};

/** How long one pass runs, for callers that need to schedule around it. */
export function loaderDuration(
  tempo: LoaderTempo,
  withAnniversary: boolean,
): number {
  const t = LOADER_TIMELINES[tempo];
  return withAnniversary ? t.durationAnniversary : t.duration;
}

const easeOut = [0.22, 1, 0.36, 1] as const;
/** Heavy in-out, the "expensive machinery" feel for the exits. */
const easeInOutQuint = [0.83, 0, 0.17, 1] as const;

type LetterProps = {
  /** Usually a single character, but any inline content works. */
  char: ReactNode;
  delay: number;
  duration: number;
  className?: string;
  /** False renders the finished letter with no entrance. */
  animateIn?: boolean;
};

/**
 * A single letter. The outer span grows from zero width so the line keeps
 * re-centering, while the inner span rotates out from its left edge — reading
 * as the letter emerging from behind its neighbour.
 *
 * `whitespace-nowrap` on the inner span is load-bearing for multi-character
 * content: while the outer span sits at width 0, that zero-width containing
 * block forces a break at any opportunity, so "@10" would stack the "@" on its
 * own line above the "10" until the width opened up.
 */
function Letter({
  char,
  delay,
  duration,
  className,
  animateIn = true,
}: LetterProps) {
  return (
    <motion.span
      className="inline-block"
      style={{ transformStyle: 'preserve-3d' }}
      initial={animateIn ? { width: 0 } : false}
      animate={{ width: 'auto' }}
      transition={{ duration, delay, ease: easeOut }}
    >
      <motion.span
        className={`inline-block origin-left whitespace-nowrap ${className ?? ''}`}
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        initial={
          animateIn
            ? { opacity: 0, rotateY: -105, z: -140, scaleX: 0.4 }
            : false
        }
        animate={{ opacity: 1, rotateY: 0, z: 0, scaleX: 1 }}
        transition={{ duration, delay, ease: easeOut }}
      >
        {char}
      </motion.span>
    </motion.span>
  );
}

type WordGapProps = {
  delay: number;
  duration: number;
  animateIn?: boolean;
};

/** The gap between ACOB and LIGHTING, opening up alongside the L. */
function WordGap({ delay, duration, animateIn = true }: WordGapProps) {
  return (
    <motion.span
      className="inline-block"
      initial={animateIn ? { width: 0 } : false}
      animate={{ width: `${WORD_GAP_EM}em` }}
      transition={{ duration, delay, ease: easeOut }}
    />
  );
}

export default function AcobWordmarkLoader({
  onComplete,
  wordmarkVariants,
  mode = 'animate',
  showAnniversary = false,
  tempo = 'tight',
}: {
  onComplete?: () => void;
  /** Optional variants applied to the wordmark block, so an exit can move it. */
  wordmarkVariants?: Variants;
  /**
   * 'animate' plays the full build sequence.
   * 'rest' renders the finished wordmark with a slow breath — used for the
   * route-transition fallback, where replaying the build would be too long and
   * would collide with the intro overlay on a cold load.
   */
  mode?: 'animate' | 'rest';
  /** Reveal the gold "@10" anniversary mark beside Technology. */
  showAnniversary?: boolean;
  /** Pacing preset. 'tight' ships; 'full' is the original, for comparison. */
  tempo?: LoaderTempo;
}) {
  const animateIn = mode === 'animate';
  const t = LOADER_TIMELINES[tempo];

  useEffect(() => {
    if (!onComplete) {
      return;
    }
    const pass = loaderDuration(tempo, showAnniversary);
    const timer = setTimeout(() => onComplete(), pass * 1000);
    return () => clearTimeout(timer);
  }, [onComplete, showAnniversary, tempo]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[hsl(var(--loader-surface))]">
      <motion.div
        className="flex flex-col items-center"
        style={{ perspective: '1000px' }}
        variants={wordmarkVariants}
        animate={animateIn ? undefined : { opacity: [1, 0.55, 1] }}
        transition={
          animateIn
            ? undefined
            : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* ACOB LIGHTING */}
        <div
          className="flex items-baseline whitespace-nowrap font-bold leading-none tracking-tight text-[hsl(var(--loader-ink))]"
          style={{
            fontSize: 'clamp(2.25rem, 9vw, 5.5rem)',
            transformStyle: 'preserve-3d',
          }}
        >
          {BRAND.split('').map((char, i) => (
            <Letter
              key={`brand-${i}`}
              char={char}
              delay={
                i === 0 ? t.aStart : t.brandStart + t.brandStagger * (i - 1)
              }
              duration={t.letterDuration}
              animateIn={animateIn}
            />
          ))}

          {/* the gap before LIGHTING opens up with the L */}
          <WordGap
            delay={t.lightingStart}
            duration={t.letterDuration}
            animateIn={animateIn}
          />

          {LIGHTING.split('').map((char, i) => (
            <Letter
              key={`lighting-${i}`}
              char={char}
              delay={t.lightingStart + t.lightingStagger * i}
              duration={t.letterDuration}
              className="text-[hsl(var(--loader-accent))]"
              animateIn={animateIn}
            />
          ))}
        </div>

        {/* TECHNOLOGY slides down from underneath the line above */}
        <motion.div
          className="overflow-hidden"
          initial={animateIn ? { height: 0 } : false}
          animate={{ height: 'auto' }}
          transition={{
            duration: t.techDuration,
            delay: t.techStart,
            ease: easeOut,
          }}
        >
          <motion.div
            className="pt-2 text-center font-semibold uppercase text-[hsl(var(--loader-sub))]"
            style={{ fontSize: 'clamp(0.8rem, 3vw, 1.6rem)' }}
            initial={animateIn ? { y: '-110%', opacity: 0 } : false}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: t.techDuration,
              delay: t.techStart,
              ease: easeOut,
            }}
          >
            <span
              className="inline-flex items-baseline"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span style={{ letterSpacing: '0.42em', paddingLeft: '0.42em' }}>
                Technology
              </span>
              {showAnniversary && (
                <Letter
                  char={
                    <>
                      <span
                        className="inline-block"
                        style={{ transform: `translateY(-${AT_RISE_EM}em)` }}
                      >
                        @
                      </span>
                      10
                    </>
                  }
                  delay={t.anniversaryStart}
                  duration={t.letterDuration}
                  animateIn={animateIn}
                  className="font-bold text-[hsl(var(--loader-gold))]"
                />
              )}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exit animations                                                     */
/* ------------------------------------------------------------------ */

export type LoaderExit = 'curtain' | 'split' | 'foldBack' | 'zoom' | 'wipe';

export type ExitDefinition = {
  label: string;
  description: string;
  /** How long the exit runs, so callers know when the overlay is gone. */
  duration: number;
  /** Applied to the full-screen panel. */
  panel: Variants;
  /** Applied to the wordmark block inside the panel. */
  wordmark?: Variants;
  /** Renders two clipped halves that leave in opposite directions. */
  halves?: boolean;
};

export const LOADER_EXITS: Record<LoaderExit, ExitDefinition> = {
  curtain: {
    label: 'Curtain lift',
    description:
      'The whole panel is pulled straight up out of the frame like a card, corners rounding off as it leaves.',
    duration: 1.0,
    panel: {
      exit: {
        y: '-100%',
        borderBottomLeftRadius: '2.5rem',
        borderBottomRightRadius: '2.5rem',
        transition: { duration: 1.0, ease: easeInOutQuint },
      },
    },
    wordmark: {
      // Drifts slightly slower than the panel — a touch of parallax weight.
      exit: { y: 60, transition: { duration: 1.0, ease: easeInOutQuint } },
    },
  },

  split: {
    label: 'Split apart',
    description:
      'The panel tears along the middle of the wordmark; top half exits up, bottom half exits down.',
    duration: 0.95,
    halves: true,
    panel: {
      exit: { transition: { duration: 0.95, ease: easeInOutQuint } },
    },
  },

  foldBack: {
    label: 'Fold back',
    description:
      'The wordmark folds away from the viewer the way it came in, then the panel drops out behind it.',
    duration: 1.1,
    panel: {
      exit: {
        opacity: 0,
        transition: { duration: 0.45, delay: 0.5, ease: 'easeInOut' },
      },
    },
    wordmark: {
      exit: {
        rotateX: 78,
        y: 70,
        scale: 0.82,
        opacity: 0,
        transition: { duration: 0.7, ease: [0.6, 0, 0.9, 0.4] },
      },
    },
  },

  zoom: {
    label: 'Push through',
    description:
      'The wordmark rushes toward the viewer and blows past the camera while the panel fades out.',
    duration: 0.9,
    panel: {
      exit: {
        opacity: 0,
        transition: { duration: 0.5, delay: 0.35, ease: 'easeIn' },
      },
    },
    wordmark: {
      exit: {
        scale: 2.6,
        opacity: 0,
        filter: 'blur(14px)',
        transition: { duration: 0.9, ease: [0.5, 0, 0.75, 0] },
      },
    },
  },

  wipe: {
    label: 'Wipe up',
    description:
      'Nothing moves — the panel is erased from the bottom edge upward, uncovering the page beneath it.',
    duration: 0.9,
    panel: {
      exit: {
        clipPath: 'inset(0% 0% 100% 0%)',
        transition: { duration: 0.9, ease: easeInOutQuint },
      },
    },
    wordmark: {
      exit: {
        opacity: 0,
        transition: { duration: 0.5, delay: 0.25, ease: 'easeIn' },
      },
    },
  },
};

export const LOADER_EXIT_ORDER: LoaderExit[] = [
  'curtain',
  'split',
  'foldBack',
  'zoom',
  'wipe',
];
