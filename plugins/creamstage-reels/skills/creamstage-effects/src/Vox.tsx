// CreamStage Vox kit — paper-collage explainer look: paper background, torn cut-outs with tape,
// typewriter captions, label strips, hand-drawn marker circles, pin board with red yarn.
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import {S, INK, SANS, SERIF, clamp} from './theme';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const spring = Easing.bezier(0.34, 1.56, 0.64, 1);
export const VOX_RED = '#E0392B';
export const VOX_YELLOW = '#FFD84D';
export const PAPER = '#EFE6D2';
const MONO = '"Courier New", "DejaVu Sans Mono", "Liberation Mono", monospace';

// Warm paper with fibre noise + vignette. Put it as the scene background.
export const PaperBg: React.FC<{tone?: string; seed?: number; dark?: boolean}> = ({tone = PAPER, seed = 3, dark = false}) => (
  <AbsoluteFill style={{background: dark ? '#22201C' : tone}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: dark ? 0.5 : 0.55}}>
      <filter id={`pp${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={seed} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.55 0" /></filter>
      <rect width="100%" height="100%" filter={`url(#pp${seed})`} />
      <filter id={`pf${seed}`}><feTurbulence type="turbulence" baseFrequency="0.012 0.25" numOctaves={2} seed={seed + 7} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0.18 0" /></filter>
      <rect width="100%" height="100%" filter={`url(#pf${seed})`} />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,40,10,0.28) 100%)'}} />
  </AbsoluteFill>
);

const torn = (w: number, h: number, seed: string, amp = 7, step = 16) => {
  const pts: string[] = [];
  const push = (x: number, y: number) => pts.push(`${x.toFixed(1)}px ${y.toFixed(1)}px`);
  for (let x = 0; x <= w; x += step) push(x, random(seed + 't' + x) * amp);
  for (let y = 0; y <= h; y += step) push(w - random(seed + 'r' + y) * amp, y);
  for (let x = w; x >= 0; x -= step) push(x, h - random(seed + 'b' + x) * amp);
  for (let y = h; y >= 0; y -= step) push(random(seed + 'l' + y) * amp, y);
  return `polygon(${pts.join(',')})`;
};

// Photo / screenshot on torn white paper, slapped onto the page with tape.
export const TornCutout: React.FC<{src: string; x: number; y: number; w: number; h: number; t: number; rot?: number; from?: 'left' | 'right' | 'top' | 'bottom' | 'drop'; tape?: boolean; fit?: 'cover' | 'contain'; position?: string; seed?: string; mono?: boolean}> = ({src, x, y, w, h, t, rot = -3, from = 'drop', tape = true, fit = 'cover', position = '50% 50%', seed = 'a', mono = false}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [S(t), S(t) + 12], [0, 1], {...clamp, easing: ease});
  if (p <= 0) return null;
  const off = from === 'left' ? [-900, 0] : from === 'right' ? [900, 0] : from === 'top' ? [0, -1200] : from === 'bottom' ? [0, 1300] : [0, 0];
  const sc = from === 'drop' ? interpolate(p, [0, 0.7, 1], [1.35, 0.97, 1]) : 1;
  const pad = 16;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, translate: `${off[0] * (1 - p)}px ${off[1] * (1 - p)}px`, rotate: `${rot + (1 - p) * (from === 'drop' ? 8 : -6)}deg`, scale: String(sc), opacity: Math.min(1, p * 2), filter: 'drop-shadow(0 18px 22px rgba(40,25,5,0.35))'}}>
      <div style={{position: 'absolute', inset: 0, background: '#FBF8F0', clipPath: torn(w, h, seed)}}>
        <Img src={staticFile(src)} style={{position: 'absolute', left: pad, top: pad, width: w - pad * 2, height: h - pad * 2, objectFit: fit, objectPosition: position, filter: mono ? 'grayscale(1) contrast(1.15) sepia(0.25)' : 'saturate(0.92) contrast(1.03)'}} />
      </div>
      {tape && <>
        <div style={{position: 'absolute', left: w * 0.5 - 70, top: -22, width: 140, height: 42, background: 'rgba(238,226,190,0.78)', rotate: `${random(seed + 'tp') * 10 - 5}deg`, boxShadow: '0 2px 4px rgba(0,0,0,0.12)'}} />
      </>}
    </div>
  );
};

// Black strip label sliding in (Vox callout).
export const VoxLabel: React.FC<{text: string; x: number; y: number; t: number; bg?: string; color?: string; size?: number; rot?: number}> = ({text, x, y, t, bg = INK, color = '#fff', size = 40, rot = -2}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [S(t), S(t) + 9], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', left: x, top: y, rotate: `${rot}deg`, overflow: 'hidden', opacity: p > 0 ? 1 : 0}}>
      <div style={{padding: '12px 22px', background: bg, color, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 1, textTransform: 'uppercase', clipPath: `inset(0 ${100 - p * 100}% 0 0)`, whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

// Typewriter text on a paper slip.
export const Typewriter: React.FC<{text: string; x: number; y: number; t: number; size?: number; cps?: number; width?: number; slip?: boolean}> = ({text, x, y, t, size = 38, cps = 22, width = 900, slip = true}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor((f - S(t)) / 30 * cps));
  if (f < S(t)) return null;
  const cursor = Math.floor(f / 8) % 2 === 0 && n < text.length;
  return (
    <div style={{position: 'absolute', left: x, top: y, maxWidth: width, padding: slip ? '14px 22px' : 0, background: slip ? '#FBF8F0' : 'transparent', boxShadow: slip ? '0 8px 16px rgba(40,25,5,0.2)' : 'none', rotate: slip ? '-1deg' : '0deg', fontFamily: MONO, fontWeight: 700, fontSize: size, color: INK, lineHeight: 1.3, whiteSpace: 'pre-wrap'}}>
      {text.slice(0, n)}{cursor ? '▌' : ''}
    </div>
  );
};

// Big serif headline with yellow highlighter swipe behind a key word.
export const VoxHeadline: React.FC<{pre?: string; key_: string; post?: string; x?: number; y: number; t: number; size?: number}> = ({pre = '', key_, post = '', x = 60, y, t, size = 96}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [S(t), S(t) + 10], [0, 1], {...clamp, easing: ease});
  const hl = interpolate(f, [S(t) + 8, S(t) + 20], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1080 - x * 2, fontFamily: SERIF, fontStyle: 'italic', fontSize: size, lineHeight: 1.05, color: INK, opacity: p, translate: `0 ${(1 - p) * 20}px`}}>
      {pre}{' '}
      <span style={{position: 'relative', display: 'inline-block'}}>
        <span style={{position: 'absolute', left: -8, right: -8, top: '18%', bottom: '4%', background: VOX_YELLOW, transformOrigin: 'left', scale: `${hl} 1`, zIndex: 0, rotate: '-1deg'}} />
        <span style={{position: 'relative'}}>{key_}</span>
      </span>{' '}{post}
    </div>
  );
};

// Hand-drawn marker loop around something (draws on).
export const MarkerLoop: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string; seed?: string}> = ({x, y, w, h, t, color = VOX_RED, seed = 'm'}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [S(t), S(t) + 14], [0, 1], {...clamp, easing: ease});
  if (p <= 0) return null;
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2.15 - 0.4, wob = 1 + (random(seed + i) - 0.5) * 0.06;
    pts.push(`${i ? 'L' : 'M'}${(w / 2 + Math.cos(a) * w / 2 * wob).toFixed(1)} ${(h / 2 + Math.sin(a) * h / 2 * wob).toFixed(1)}`);
  }
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={w} height={h}>
      <path d={pts.join('')} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.9} />
    </svg>
  );
};

// Investigation board: pins with paper tags, joined by red yarn that draws on.
export const PinBoard: React.FC<{pins: {x: number; y: number; label: string; t: number}[]; links: [number, number, number][]}> = ({pins, links}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {links.map(([a, b, t], i) => {
          const A = pins[a], B = pins[b];
          const p = interpolate(f, [S(t), S(t) + 16], [0, 1], {...clamp, easing: ease});
          const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 + 60;
          return <path key={i} d={`M${A.x} ${A.y} Q${mx} ${my} ${B.x} ${B.y}`} fill="none" stroke={VOX_RED} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} style={{filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.25))'}} />;
        })}
      </svg>
      {pins.map((p, i) => {
        const q = interpolate(f, [S(p.t), S(p.t) + 9], [0, 1], {...clamp, easing: spring});
        return (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y, opacity: q > 0 ? 1 : 0}}>
            <div style={{position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: 99, background: VOX_RED, boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.25), 0 4px 6px rgba(0,0,0,0.3)', scale: String(q)}} />
            <div style={{position: 'absolute', left: -110, top: 22, width: 220, textAlign: 'center', padding: '8px 10px', background: '#FBF8F0', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: INK, rotate: `${(i % 2 ? 2 : -2)}deg`, boxShadow: '0 6px 10px rgba(40,25,5,0.25)', scale: String(q)}}>{p.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
