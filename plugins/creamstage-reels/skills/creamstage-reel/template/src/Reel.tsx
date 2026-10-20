import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Video} from '@remotion/media';
import {PAGES, CAPTIONS_END, Page} from './captions';
import {C} from './cues';
import {S, CREAM, INK, BLUE, BLUE_LIGHT, SANS, SERIF, inOut, out, clamp} from './theme';
import {Sfx} from './Sfx';
import {TitleCard, Leaders, FreeEntry, TenWebsites, Sites, Checklist, Cta, FollowShare} from './Scenes';

// cream panel height: 0 hidden, 760 title split, 900 split, 1920 full
const PANEL: [number, number][] = [
  [C.titleIn, 0], [C.titleIn + 0.36, 760], [C.leadersIn - 0.1, 760], [C.leadersIn + 0.26, 900],
  [C.fullIn - 0.18, 900], [C.fullIn + 0.18, 1920], [C.fullOut - 0.18, 1920], [C.fullOut + 0.18, 0],
  [C.webIn - 0.18, 0], [C.webIn + 0.18, 900], [C.webOut - 0.18, 900], [C.webOut + 0.18, 0],
  [C.sitesIn - 0.18, 0], [C.sitesIn + 0.18, 900], [C.ctaIn - 0.18, 900], [C.ctaIn + 0.18, 1920], [C.end, 1920],
];
export const usePanelH = () => {
  const f = useCurrentFrame();
  return interpolate(f, PANEL.map(([t]) => S(t)), PANEL.map(([, h]) => h), {...clamp, easing: inOut});
};

// A-roll: subtle zoom in the first 3 s, then gentle punch-ins
const ZOOMS: [number, number][] = [[3.0, 1.06], [C.buyers, 1.0], [C.system, 1.07], [C.follow - 2.1, 1.0], [C.follow, 1.07], [C.share, 1.0]];
const ARoll: React.FC = () => {
  const f = useCurrentFrame();
  const h = usePanelH();
  let scale = interpolate(f, [0, S(3.0)], [1.0, 1.06], {...clamp, easing: Easing.inOut(Easing.sin)});
  for (let i = 1; i < ZOOMS.length; i++) {
    const [t, sc] = ZOOMS[i];
    if (f >= S(t)) scale = interpolate(f, [S(t), S(t) + 5], [ZOOMS[i - 1][1], sc], {...clamp, easing: out});
  }
  const shiftY = interpolate(h, [0, 760, 900, 1920], [0, 360, 420, 420], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{translate: `0px ${shiftY}px`, scale: String(scale), transformOrigin: '50% 30%'}}>
        <Video src={staticFile('aroll.mp4')} style={{width: 1080, height: 1920, objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(0,0,0,0.28) 90%, rgba(0,0,0,0.42) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- captions ----------
const CaptionPage: React.FC<{page: Page; end: number; cream: boolean}> = ({page, end, cream}) => {
  const f = useCurrentFrame();
  const fadeOut = interpolate(f, [S(end) - 3, S(end)], [1, 0], clamp);
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 18, maxWidth: 920, opacity: fadeOut}}>
      {page.words.map((w, i) => {
        const p = interpolate(f, [S(w.s) - 1, S(w.s) + 5], [0, 1], {...clamp, easing: out});
        const a = !!w.a;
        return (
          <span key={i} style={{fontFamily: a ? SERIF : SANS, fontStyle: a ? 'italic' : 'normal', fontWeight: a ? 400 : 600, fontSize: a ? 100 : 50, letterSpacing: a ? -1 : -0.5, lineHeight: a ? '1.02' : '1.25', color: cream ? (a ? BLUE : INK) : a ? BLUE_LIGHT : '#fff', textShadow: cream ? 'none' : a ? '0 4px 24px rgba(20,40,120,0.55)' : '0 2px 14px rgba(0,0,0,0.7)', opacity: p, translate: `0px ${interpolate(p, [0, 1], [a ? 22 : 12, 0])}px`, scale: String(interpolate(p, [0, 1], [a ? 0.86 : 1, 1])), filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`, display: 'inline-block'}}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const h = usePanelH();
  if (t >= CAPTIONS_END) return null;
  let idx = -1;
  for (let i = 0; i < PAGES.length; i++) if (t >= PAGES[i].s) idx = i;
  if (idx < 0) return null;
  const end = idx + 1 < PAGES.length ? PAGES[idx + 1].s : CAPTIONS_END;
  const y = interpolate(h, [0, 760, 900, 1920], [1340, 870, 975, 1640], clamp);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: y, translate: '0 -50%', width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: h > 600 && h < 1500 ? '10px 30px 14px' : 0, borderRadius: 30, background: h > 600 && h < 1500 ? 'rgba(12,14,22,0.5)' : 'transparent', backdropFilter: h > 600 && h < 1500 ? 'blur(6px)' : 'none'}}><CaptionPage key={idx} page={PAGES[idx]} end={end} cream={h > 1500} /></div>
      </div>
    </AbsoluteFill>
  );
};

const Panel: React.FC = () => {
  const h = usePanelH();
  if (h < 1) return null;
  const full = h > 1910;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: h, overflow: 'hidden', background: `radial-gradient(120% 80% at 50% 25%, #FDFBF6 0%, ${CREAM} 55%, #E8E2D4 100%)`, borderBottomLeftRadius: full ? 0 : 56, borderBottomRightRadius: full ? 0 : 56, boxShadow: '0 30px 80px rgba(0,0,0,0.4)'}}>
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 1.4px, transparent 1.4px)', backgroundSize: '36px 36px', opacity: 0.55}} />
        <TitleCard />
        <Leaders />
        <FreeEntry />
        <TenWebsites />
        <Sites />
        <Checklist />
        <Cta />
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <ARoll />
    <Panel />
    <FollowShare />
    <Captions />
    <Sfx />
  </AbsoluteFill>
);
