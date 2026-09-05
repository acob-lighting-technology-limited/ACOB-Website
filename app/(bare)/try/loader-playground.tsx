'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import AcobLoaderOverlay from '@/components/loader/acob-loader-overlay';
import {
  loaderDuration,
  LOADER_EXITS,
  LOADER_EXIT_ORDER,
  type LoaderExit,
  type LoaderTempo,
} from '@/components/loader/acob-wordmark-loader';
import { Button } from '@/components/ui/button';

/** Stand-in for the real page, so the exits have something to uncover. */
function FakePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-primary/10 to-background px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Powering Nigeria with solar
      </h1>
      <p className="max-w-xl text-muted-foreground">
        This is the page underneath. Whatever the loader does on the way out,
        this is what it reveals.
      </p>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {['Mini-grids', 'Solar home systems', 'Street lighting'].map(label => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-6 text-sm font-medium"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoaderPlayground() {
  const [exit, setExit] = useState<LoaderExit>('curtain');
  const [slowPage, setSlowPage] = useState(false);
  const [anniversary, setAnniversary] = useState(true);
  const [tempo, setTempo] = useState<LoaderTempo>('tight');

  // Bumping the key remounts the overlay, which replays the whole thing.
  const [runId, setRunId] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pageReady, setPageReady] = useState(true);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback(() => {
    if (slowTimer.current) {
      clearTimeout(slowTimer.current);
    }

    setPlaying(true);
    setRunId(id => id + 1);
    setPageReady(!slowPage);

    if (slowPage) {
      // Stay "loading" past the end of the build, so you can see the mark
      // hold and breathe before the exit finally fires.
      slowTimer.current = setTimeout(
        () => setPageReady(true),
        loaderDuration(tempo, anniversary) * 1200,
      );
    }
  }, [slowPage, tempo, anniversary]);

  useEffect(
    () => () => {
      if (slowTimer.current) {
        clearTimeout(slowTimer.current);
      }
    },
    [],
  );

  const handleFinished = useCallback(() => setPlaying(false), []);

  const def = LOADER_EXITS[exit];
  const introLength = loaderDuration(tempo, anniversary);

  return (
    <div className="relative min-h-screen bg-background">
      <FakePage />

      {playing && (
        <AcobLoaderOverlay
          key={runId}
          exit={exit}
          // "Slow page" holds ready false past the end of the build, so you
          // can see the mark wait before the exit fires.
          ready={pageReady}
          loop
          showAnniversary={anniversary}
          tempo={tempo}
          onFinished={handleFinished}
        />
      )}

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-[100000] border-t border-border bg-card/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            {LOADER_EXIT_ORDER.map(name => (
              <Button
                key={name}
                size="sm"
                variant={name === exit ? 'default' : 'outline'}
                onClick={() => setExit(name)}
              >
                {LOADER_EXITS[name].label}
              </Button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {def.description}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {(['tight', 'full'] as LoaderTempo[]).map(name => (
              <Button
                key={name}
                size="sm"
                variant={name === tempo ? 'secondary' : 'ghost'}
                onClick={() => setTempo(name)}
              >
                {name === 'tight' ? 'Tight' : 'Original'} ·{' '}
                {loaderDuration(name, anniversary).toFixed(2)}s
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={play} disabled={playing}>
              Play
            </Button>
            <Button variant="outline" onClick={play}>
              Restart
            </Button>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={slowPage}
                onChange={e => setSlowPage(e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              Simulate slow page (hold on the mark)
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={anniversary}
                onChange={e => setAnniversary(e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              Gold @10
            </label>
            <span className="text-xs text-muted-foreground">
              intro {introLength.toFixed(2)}s · exit {def.duration.toFixed(2)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
