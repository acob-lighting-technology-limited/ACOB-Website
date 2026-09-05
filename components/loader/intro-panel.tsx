import {
  AT_RISE_EM,
  BRAND,
  INTRO_PANEL_ID,
  INTRO_SESSION_KEY,
  LIGHTING,
  LOADER_TIMELINES,
  loaderDuration,
  type LoaderTempo,
} from './intro-timeline';

/**
 * The intro loader, rendered into the server HTML.
 *
 * Everything here is static markup plus CSS keyframes (styles/intro-loader.css)
 * so the panel paints as soon as the document does — covering the stretch
 * where the bundle is still downloading and React has nothing on screen yet.
 * The previous client-mounted overlay could only appear after hydration, which
 * is why a cold load showed a bare dark screen and then a loader over an
 * already-finished page.
 *
 * SiteRevealProvider takes it away once the page is ready; nothing here
 * depends on JS to reach its finished state.
 */

/**
 * Runs before first paint, ahead of the panel below it in the document.
 *
 * A repeat visit or a reduced-motion preference has to be settled here rather
 * than in an effect — by the time React could decide, the panel would already
 * have been on screen for a frame.
 */
function bootScript(sessionKey: string): string {
  return `(function(){try{
var d=document,h=d.documentElement;
var seen=false;try{seen=sessionStorage.getItem('${sessionKey}')==='1'}catch(e){}
var still=false;try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
if(seen||still){h.classList.add('intro-skip');return}
try{sessionStorage.setItem('${sessionKey}','1')}catch(e){}
h.classList.add('intro-active');
h.setAttribute('data-loader-active','');
window.__acobIntroStart=Date.now();
}catch(e){}})();`;
}

type LetterProps = {
  char: React.ReactNode;
  delay: number;
  className?: string;
};

/**
 * One letter: the outer span opens up horizontally so the line keeps
 * re-centering, the inner swings out from its left edge — reading as the
 * letter emerging from behind its neighbour.
 */
function Letter({ char, delay, className }: LetterProps) {
  return (
    <span
      className="intro-letter"
      style={{ '--intro-delay': `${delay}s` } as React.CSSProperties}
    >
      <span className={className}>{char}</span>
    </span>
  );
}

export default function IntroPanel({
  showAnniversary = false,
  tempo = 'tight',
}: {
  /** Reveal the gold "@10" anniversary mark beside Technology. */
  showAnniversary?: boolean;
  tempo?: LoaderTempo;
}) {
  const t = LOADER_TIMELINES[tempo];
  const build = loaderDuration(tempo, showAnniversary);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: bootScript(INTRO_SESSION_KEY) }}
      />

      <div
        id={INTRO_PANEL_ID}
        aria-hidden="true"
        data-build-duration={build}
        style={
          {
            '--intro-letter-duration': `${t.letterDuration}s`,
            '--intro-tech-duration': `${t.techDuration}s`,
            '--intro-build-duration': `${build}s`,
          } as React.CSSProperties
        }
      >
        <div className="intro-wordmark intro-breath">
          <div className="intro-line">
            {BRAND.split('').map((char, i) => (
              <Letter
                key={`brand-${i}`}
                char={char}
                delay={
                  i === 0 ? t.aStart : t.brandStart + t.brandStagger * (i - 1)
                }
              />
            ))}

            {/* the gap before LIGHTING opens up with the L */}
            <span
              className="intro-gap"
              style={
                {
                  '--intro-delay': `${t.lightingStart}s`,
                } as React.CSSProperties
              }
            />

            {LIGHTING.split('').map((char, i) => (
              <Letter
                key={`lighting-${i}`}
                char={char}
                delay={t.lightingStart + t.lightingStagger * i}
                className="intro-accent"
              />
            ))}
          </div>

          {/* TECHNOLOGY slides down from underneath the line above */}
          <div
            className="intro-tech-clip"
            style={
              { '--intro-delay': `${t.techStart}s` } as React.CSSProperties
            }
          >
            <div
              className="intro-tech"
              style={
                { '--intro-delay': `${t.techStart}s` } as React.CSSProperties
              }
            >
              <span className="intro-tech-inner">
                <span className="intro-tech-word">Technology</span>
                {showAnniversary && (
                  <Letter
                    delay={t.anniversaryStart}
                    className="intro-gold"
                    char={
                      <>
                        <span
                          className="intro-at"
                          style={
                            {
                              transform: `translateY(-${AT_RISE_EM}em)`,
                            } as React.CSSProperties
                          }
                        >
                          @
                        </span>
                        10
                      </>
                    }
                  />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
