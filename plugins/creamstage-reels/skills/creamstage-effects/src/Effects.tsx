// CreamStage Effects pack — drop-in scenes/components. All timing in seconds on the composition timeline.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing, delayRender, continueRender} from 'remotion';
import {Video} from '@remotion/media';
import {Lottie} from '@remotion/lottie';
import {S, INK, BLUE, CREAM, SANS, SERIF, inOut, out, clamp} from './theme';

const spring = Easing.bezier(0.34, 1.56, 0.64, 1);
export const popP = (f: number, t: number, d = 9) => interpolate(f, [S(t), S(t) + d], [0, 1], {...clamp, easing: spring});
export const inP = (f: number, t: number, d = 10) => interpolate(f, [S(t), S(t) + d], [0, 1], {...clamp, easing: out});

// ───────────────────────── 1. Kinetic hook ─────────────────────────
// Giant word slams in letter by letter (scale 1.6→1, blur→sharp, tiny shake), sub-line rises under it.
export const KineticHook: React.FC<{word: string; sub?: string; t: number; dark?: boolean; size?: number}> = ({word, sub, t, dark = true, size}) => {
  const f = useCurrentFrame();
  const words = word.split(' ');
  const longest = Math.max(...words.map((w) => w.length));
  const fs = size ?? Math.min(300, Math.floor(960 / (longest * 0.62)));
  const total = word.replace(/ /g, '').length;
  const shake = interpolate(f, [S(t) + total * 2, S(t) + total * 2 + 8], [1, 0], clamp);
  let k = 0;
  return (
    <AbsoluteFill style={{background: dark ? '#0E1116' : CREAM, alignItems: 'center', justifyContent: 'center', translate: `${Math.sin(f * 2.3) * 8 * shake}px ${Math.cos(f * 1.9) * 6 * shake}px`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {words.map((w, wi) => (
          <div key={wi} style={{whiteSpace: 'nowrap', lineHeight: 0.95}}>
            {w.split('').map((ch, i) => {
              const idx = k++;
              const p = interpolate(f, [S(t) + idx * 2, S(t) + idx * 2 + 7], [0, 1], {...clamp, easing: out});
              return <span key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: -fs * 0.03, color: dark ? '#fff' : INK, opacity: p, scale: String(interpolate(p, [0, 1], [1.6, 1])), filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)`, display: 'inline-block'}}>{ch}</span>;
            })}
          </div>
        ))}
      </div>
      {sub && <div style={{marginTop: 30, fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: dark ? '#7EA6FF' : BLUE, opacity: inP(f, t + total * 0.07 + 0.15), translate: `0px ${interpolate(inP(f, t + total * 0.07 + 0.15), [0, 1], [30, 0])}px`}}>{sub}</div>}
    </AbsoluteFill>
  );
};

// ───────────────────────── 2. World map with routes ─────────────────────────
type World = {w: number; h: number; countries: Record<string, {n: string; d: string; c: [number, number]}>};
const useWorld = () => {
  const [w, setW] = useState<World | null>(null);
  const [handle] = useState(() => delayRender('world map'));
  useEffect(() => { fetch(staticFile('data/world.json')).then((r) => r.json()).then((j) => { setW(j); continueRender(handle); }); }, [handle]);
  return w;
};
// from: ISO3 origin (e.g. 'IND'); to: list of {iso, label?, t}; camera eases from world view into the region covering all points.
export const RouteMap: React.FC<{from: string; to: {iso: string; label?: string; t: number}[]; t: number; fromLabel?: string; height?: number}> = ({from, to, t, fromLabel, height = 1100}) => {
  const f = useCurrentFrame();
  const world = useWorld();
  if (!world) return null;
  const C = world.countries;
  const pts = [C[from].c, ...to.map((x) => C[x.iso].c)];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const pad = 160;
  let bx = Math.min(...xs) - pad, by = Math.min(...ys) - pad, bw = Math.max(...xs) - bx + pad, bh = Math.max(...ys) - by + pad;
  const aspect = 1080 / height; // keep frame aspect
  if (bw / bh > aspect) { const nh = bw / aspect; by -= (nh - bh) / 2; bh = nh; } else { const nw = bh * aspect; bx -= (nw - bw) / 2; bw = nw; }
  const cam = interpolate(f, [S(t), S(t) + 30], [0, 1], {...clamp, easing: inOut});
  const vb = [interpolate(cam, [0, 1], [0, bx]), interpolate(cam, [0, 1], [(world.h - world.w / aspect) / 2, by]), interpolate(cam, [0, 1], [world.w, bw]), interpolate(cam, [0, 1], [world.w / aspect, bh])];
  const k = vb[2] / 1080; // svg units per px
  const hl = new Set([from, ...to.map((x) => x.iso)]);
  return (
    <svg width={1080} height={height} viewBox={vb.join(' ')} style={{display: 'block'}}>
      <rect x={-500} y={-500} width={4000} height={3000} fill={CREAM} />
      {Object.entries(C).map(([iso, c]) => (
        <path key={iso} d={c.d} fill={iso === from ? INK : hl.has(iso) ? BLUE : '#E2DBCD'} fillOpacity={iso === from || !hl.has(iso) ? 1 : interpolate(f, [S(to.find((x) => x.iso === iso)!.t), S(to.find((x) => x.iso === iso)!.t) + 10], [0.25, 1], clamp)} stroke="#F7F3EA" strokeWidth={0.6 * k} />
      ))}
      {to.map((x, i) => {
        const a = C[from].c, b = C[x.iso].c;
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.35;
        const r = interpolate(f, [S(x.t) - 6, S(x.t) + 16], [0, 1], {...clamp, easing: inOut});
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.3;
        const q = (u: number) => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]];
        const [px, py] = q(r);
        const lp = popP(f, x.t + 0.5, 10);
        return (
          <g key={i}>
            <path d={`M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`} fill="none" stroke={BLUE} strokeWidth={5 * k} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - r)} />
            {r > 0 && r < 1 && <circle cx={px} cy={py} r={12 * k} fill="#fff" stroke={BLUE} strokeWidth={4 * k} />}
            <circle cx={b[0]} cy={b[1]} r={12 * k * lp} fill={BLUE} />
            <circle cx={b[0]} cy={b[1]} r={(12 + 30 * lp) * k} fill="none" stroke={BLUE} strokeOpacity={0.25} strokeWidth={3 * k} />
            <g opacity={lp} transform={`translate(${b[0]} ${b[1] - 34 * k})`}>
              <text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52 * k} fill={INK} stroke="#fff" strokeWidth={10 * k} paintOrder="stroke">{x.label ?? C[x.iso].n}</text>
            </g>
          </g>
        );
      })}
      <circle cx={C[from].c[0]} cy={C[from].c[1]} r={14 * k} fill="#fff" stroke={INK} strokeWidth={5 * k} />
      <text x={C[from].c[0]} y={C[from].c[1] + 62 * k} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52 * k} fill={INK} stroke="#fff" strokeWidth={10 * k} paintOrder="stroke" opacity={cam}>{fromLabel ?? C[from].n}</text>
    </svg>
  );
};

// ───────────────────────── 3. Charts & counters ─────────────────────────
export const Counter: React.FC<{to: number; t: number; dur?: number; prefix?: string; suffix?: string; size?: number; locale?: string}> = ({to, t, dur = 0.8, prefix = '', suffix = '', size = 220, locale = 'en-IN'}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [S(t), S(t + dur)], [0, to], {...clamp, easing: Easing.out(Easing.cubic)});
  const p = popP(f, t, 8);
  return <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color: BLUE, lineHeight: 1, opacity: p, display: 'inline-block', textShadow: '0 20px 50px rgba(47,107,255,0.25)'}}>{prefix}{Math.round(v).toLocaleString(locale)}{suffix}</span>;
};
// Vertical bars that grow in sequence; values are relative (max bar = full height).
export const BarChart: React.FC<{items: {label: string; value: number; display?: string; highlight?: boolean}[]; t: number; stagger?: number; height?: number; width?: number}> = ({items, t, stagger = 0.25, height = 520, width = 900}) => {
  const f = useCurrentFrame();
  const max = Math.max(...items.map((i) => i.value));
  const bw = Math.min(200, (width - (items.length - 1) * 40) / items.length);
  return (
    <div style={{width, height: height + 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 40}}>
      {items.map((it, i) => {
        const g = interpolate(f, [S(t + i * stagger), S(t + i * stagger) + 18], [0, 1], {...clamp, easing: out});
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: it.highlight ? BLUE : INK, opacity: g}}>{it.display ?? it.value}</div>
            <div style={{width: bw, height: Math.max(8, (it.value / max) * height * g), borderRadius: 20, background: it.highlight ? BLUE : INK, boxShadow: '0 16px 40px rgba(10,15,40,0.18)'}} />
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, textAlign: 'center', maxWidth: bw + 40}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};
// Line chart that draws itself; points are y-values; labels optional.
export const LineChart: React.FC<{values: number[]; labels?: string[]; t: number; dur?: number; width?: number; height?: number}> = ({values, labels, t, dur = 1.2, width = 900, height = 460}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [S(t), S(t + dur)], [0, 1], {...clamp, easing: inOut});
  const mx = Math.max(...values), mn = Math.min(...values);
  const pts = values.map((v, i) => [40 + (i / (values.length - 1)) * (width - 80), height - 40 - ((v - mn) / (mx - mn || 1)) * (height - 100)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  const len = pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  const last = Math.min(pts.length - 1, Math.floor(r * (pts.length - 1) + 0.0001));
  return (
    <svg width={width} height={height + 50}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={40} x2={width - 40} y1={40 + g * (height - 80)} y2={40 + g * (height - 80)} stroke="rgba(0,0,0,0.08)" strokeWidth={2} />)}
      <path d={`${d} L${pts[pts.length - 1][0]} ${height - 40} L${pts[0][0]} ${height - 40}Z`} fill="rgba(47,107,255,0.10)" opacity={r} />
      <path d={d} fill="none" stroke={BLUE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - r)} />
      {pts.slice(0, last + 1).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={11} fill="#fff" stroke={BLUE} strokeWidth={5} />)}
      {labels?.map((l, i) => <text key={i} x={pts[i][0]} y={height + 30} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={26} fill="rgba(21,21,21,0.6)">{l}</text>)}
    </svg>
  );
};

// ───────────────────────── 4. Device mockups ─────────────────────────
type Media = {src: string; video?: boolean; from?: number; skip?: number; fit?: 'cover' | 'contain'; position?: string};
const MediaFill: React.FC<{m: Media; w: number; h: number}> = ({m, w, h}) =>
  m.video ? <Video src={staticFile(m.src)} from={m.from ?? 0} trimBefore={Math.round((m.skip ?? 0) * 30)} muted style={{width: w, height: h, objectFit: m.fit ?? 'cover', objectPosition: m.position ?? '50% 0%'}} />
          : <Img src={staticFile(m.src)} style={{width: w, height: h, objectFit: m.fit ?? 'cover', objectPosition: m.position ?? '50% 0%'}} />;
// iPhone-style frame, tilts in (3D) and settles; scrolls content slowly.
export const PhoneMockup: React.FC<{m: Media; t: number; scale?: number}> = ({m, t, scale = 1}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [S(t), S(t) + 20], [0, 1], {...clamp, easing: out});
  const W = 430, H = 900;
  return (
    <div style={{perspective: 1600, scale: String(scale)}}>
      <div style={{width: W + 36, height: H + 36, borderRadius: 74, background: '#111', padding: 18, boxShadow: '0 50px 100px rgba(10,15,40,0.35), inset 0 0 0 3px #333', rotate: `y ${interpolate(p, [0, 1], [-28, -8])}deg`, translate: `0px ${interpolate(p, [0, 1], [300, 0])}px`, opacity: p, transformStyle: 'preserve-3d'}}>
        <div style={{width: W, height: H, borderRadius: 56, overflow: 'hidden', position: 'relative', background: '#fff'}}>
          <MediaFill m={m} w={W} h={H} />
          <div style={{position: 'absolute', top: 14, left: '50%', translate: '-50% 0', width: 130, height: 36, borderRadius: 20, background: '#111'}} />
        </div>
      </div>
    </div>
  );
};
// Laptop frame for wide screen recordings.
export const LaptopMockup: React.FC<{m: Media; t: number; width?: number}> = ({m, t, width = 980}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [S(t), S(t) + 20], [0, 1], {...clamp, easing: out});
  const sw = width - 60, sh = Math.round(sw * 0.62);
  return (
    <div style={{perspective: 2000, opacity: p}}>
      <div style={{rotate: `x ${interpolate(p, [0, 1], [35, 8])}deg`, transformOrigin: '50% 100%', translate: `0px ${interpolate(p, [0, 1], [120, 0])}px`}}>
        <div style={{width, padding: 30, paddingBottom: 34, borderRadius: '28px 28px 8px 8px', background: '#1A1C20', boxShadow: '0 40px 90px rgba(10,15,40,0.35)'}}>
          <div style={{width: sw, height: sh, borderRadius: 6, overflow: 'hidden', background: '#fff'}}><MediaFill m={m} w={sw} h={sh} /></div>
        </div>
      </div>
      <div style={{width: width + 120, marginLeft: -60, height: 28, borderRadius: '4px 4px 30px 30px', background: 'linear-gradient(#C9CCD2,#9EA3AB)', boxShadow: '0 18px 40px rgba(10,15,40,0.25)'}} />
    </div>
  );
};

// ───────────────────────── 5. Annotations (draw over any screenshot/recording) ─────────────────────────
// Coordinates are in the parent box's pixels.
export const CircleMark: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string}> = ({x, y, w, h, t, color = '#E5322D'}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [S(t), S(t) + 14], [0, 1], {...clamp, easing: out});
  const per = Math.PI * (w + h) / 2 * 1.15;
  return <svg style={{position: 'absolute', left: x - 20, top: y - 20, overflow: 'visible'}} width={w + 40} height={h + 40}><ellipse cx={(w + 40) / 2} cy={(h + 40) / 2} rx={w / 2 + 12} ry={h / 2 + 10} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={per} strokeDashoffset={per * (1 - r)} transform={`rotate(-8 ${(w + 40) / 2} ${(h + 40) / 2})`} /></svg>;
};
export const HighlightMark: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string}> = ({x, y, w, h, t, color = 'rgba(255,214,0,0.45)'}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [S(t), S(t) + 10], [0, 1], {...clamp, easing: out});
  return <div style={{position: 'absolute', left: x - 6, top: y - 4, width: (w + 12) * r, height: h + 8, background: color, borderRadius: 6, mixBlendMode: 'multiply'}} />;
};
export const UnderlineMark: React.FC<{x: number; y: number; w: number; t: number; color?: string}> = ({x, y, w, t, color = BLUE}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [S(t), S(t) + 10], [0, 1], {...clamp, easing: out});
  return <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={w} height={20}><path d={`M0 10 Q${w / 2} 2 ${w} 10`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={w * 1.1} strokeDashoffset={w * 1.1 * (1 - r)} /></svg>;
};
export const ArrowMark: React.FC<{x1: number; y1: number; x2: number; y2: number; t: number; color?: string}> = ({x1, y1, x2, y2, t, color = '#E5322D'}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [S(t), S(t) + 12], [0, 1], {...clamp, easing: out});
  const ex = x1 + (x2 - x1) * r, ey = y1 + (y2 - y1) * r, a = Math.atan2(y2 - y1, x2 - x1);
  return <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}><line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={8} strokeLinecap="round" />{r > 0.95 && <path d={`M${x2} ${y2} L${x2 - 30 * Math.cos(a - 0.5)} ${y2 - 30 * Math.sin(a - 0.5)} M${x2} ${y2} L${x2 - 30 * Math.cos(a + 0.5)} ${y2 - 30 * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={8} strokeLinecap="round" />}</svg>;
};

// ───────────────────────── 6. Picture-in-picture speaker bubble ─────────────────────────
// Asset fills the screen; the A-roll (speaker) sits in a round bubble. Pass the same A-roll src used by the main video.
export const PipBubble: React.FC<{src: string; t: number; size?: number; corner?: 'br' | 'bl' | 'tr'; faceX?: number; faceY?: number; zoom?: number}> = ({src, t, size = 360, corner = 'br', faceX = 0.5, faceY = 0.5, zoom = 1.5}) => {
  const f = useCurrentFrame();
  const p = popP(f, t, 12);
  const pos = corner === 'br' ? {right: 50, bottom: 360} : corner === 'bl' ? {left: 50, bottom: 360} : {right: 50, top: 180};
  const W = size * zoom, H = W * 16 / 9; // faceX/faceY = where the face sits in the 9:16 A-roll (0..1)
  return (
    <div style={{position: 'absolute', ...pos, width: size, height: size, borderRadius: 999, overflow: 'hidden', border: '8px solid #fff', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', scale: String(interpolate(p, [0, 1], [0.3, 1])), opacity: p}}>
      <Video src={staticFile(src)} muted style={{position: 'absolute', width: W, height: H, maxWidth: 'none', objectFit: 'cover', left: size / 2 - faceX * W, top: size / 2 - faceY * H}} />
    </div>
  );
};

// ───────────────────────── 7. Text behind you (needs cut-out) ─────────────────────────
// Place INSIDE the A-roll layer stack: base A-roll is already playing underneath. `fg` = transparent WebM of the
// speaker made by scripts/matte.py for the same time range; `from` = composition frame where that range starts.
// Big text is drawn between the background footage and the cut-out speaker, so the person appears in front of it.
export const TextBehind: React.FC<{text: string; fg: string; from: number; t: number; color?: string; y?: number; size?: number; outline?: boolean}> = ({text, fg, from, t, color = '#fff', y = 380, size, outline = false}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const longest = Math.max(...words.map((w) => w.length));
  const fs = size ?? Math.min(360, Math.floor(1000 / (longest * 0.6)));
  const p = interpolate(f, [S(t), S(t) + 10], [0, 1], {...clamp, easing: out});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: y, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, scale: String(interpolate(p, [0, 1], [1.25, 1])), filter: `blur(${interpolate(p, [0, 1], [10, 0])}px)`}}>
        {words.map((w, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: fs, lineHeight: 0.9, letterSpacing: -fs * 0.03, color: outline ? 'transparent' : color, WebkitTextStroke: outline ? `4px ${color}` : undefined, whiteSpace: 'nowrap', textShadow: outline ? 'none' : '0 10px 40px rgba(0,0,0,0.25)'}}>{w}</div>)}
      </div>
      <Video src={staticFile(fg)} from={from} transparent muted style={{position: 'absolute', width: 1080, height: 1920}} />
    </AbsoluteFill>
  );
};

// ───────────────────────── 8a. Before / after wipe ─────────────────────────
// Slider sweeps across: left of the line = BEFORE, right = AFTER. Holds at `rest` (0..1).
export const BeforeAfterWipe: React.FC<{before: Media; after: Media; t: number; w?: number; h?: number; dur?: number; rest?: number; labels?: [string, string]; radius?: number}> = ({before, after, t, w = 980, h = 1200, dur = 1.4, rest = 0.5, labels = ['BEFORE', 'AFTER'], radius = 28}) => {
  const f = useCurrentFrame();
  const ap = inP(f, t, 12);
  // sweep 1 → 0.08 → rest (shows full after, then settles)
  const x = interpolate(f, [S(t) + 6, S(t) + 6 + S(dur) * 0.55, S(t) + 6 + S(dur)], [0.97, 0.08, rest], {...clamp, easing: inOut});
  const px = x * w;
  const lab = (s: string, left: boolean) => <div style={{position: 'absolute', top: 28, [left ? 'left' : 'right']: 28, padding: '10px 22px', borderRadius: 999, background: left ? 'rgba(21,21,21,0.82)' : BLUE, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 2}}>{s}</div>;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: radius, overflow: 'hidden', opacity: ap, transform: `scale(${0.94 + 0.06 * ap})`, boxShadow: '0 30px 70px rgba(0,0,0,0.25)'}}>
      <MediaFill m={before} w={w} h={h} />
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${px}px)`}}><MediaFill m={after} w={w} h={h} />{lab(labels[1], false)}</div>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${w - px}px 0 0)`}}>{lab(labels[0], true)}</div>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: px - 3, width: 6, background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.35)'}} />
      <div style={{position: 'absolute', top: h / 2 - 44, left: px - 44, width: 88, height: 88, borderRadius: 44, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 36, color: INK}}>‹ ›</div>
    </div>
  );
};

// ───────────────────────── 8b. Film look ─────────────────────────
// Full-frame overlay: animated grain (+ optional vignette, warm tone, light leak). Use sparingly (hooks, story beats).
export const FilmLook: React.FC<{grain?: number; vignette?: number; warm?: number; leak?: boolean; t?: number; dur?: number}> = ({grain = 0.10, vignette = 0, warm = 0, leak = false, t = 0, dur}) => {
  const f = useCurrentFrame();
  const a = dur ? interpolate(f, [S(t), S(t) + 8, S(t + dur) - 8, S(t + dur)], [0, 1, 1, 0], clamp) : interpolate(f, [S(t), S(t) + 8], [0, 1], clamp);
  const seed = Math.floor(f / 2) % 97;
  const lx = interpolate(f % 120, [0, 120], [-300, 1200]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: a}}>
      {warm > 0 && <AbsoluteFill style={{background: `rgba(255,170,90,${warm})`, mixBlendMode: 'soft-light'}} />}
      {leak && <AbsoluteFill style={{background: `radial-gradient(600px 900px at ${lx}px 300px, rgba(255,120,60,0.35), transparent 70%)`, mixBlendMode: 'screen'}} />}
      {vignette > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignette}) 100%)`}} />}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: grain * 4}}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ───────────────────────── 10. Stickers (animated emoji + arrows) ─────────────────────────
// Noto animated emoji (Lottie JSON in public/emoji/<code>.json). Pops in with overshoot, optional wiggle, auto-out.
export const EMOJI = {rocket: '1f680', fire: '1f525', check: '2705', party: '1f389', bulb: '1f4a1', thumbsup: '1f44d', pointdown: '1f447', heart: '2764_fe0f', hundred: '1f4af', package: '1f4e6', globe: '1f30d', chartup: '1f4c8', thinking: '1f914', hearteyes: '1f60d', mindblown: '1f92f', clap: '1f44f', alarm: '23f0', cross: '274c', siren: '1f6a8', moneywings: '1f4b8', eyes: '1f440', raisehands: '1f64c', moneyface: '1f911'} as const;
const useJson = (path: string) => {
  const [d, setD] = useState<any>(null);
  const [h] = useState(() => delayRender('json ' + path));
  useEffect(() => { fetch(staticFile(path)).then((r) => r.json()).then((j) => { setD(j); continueRender(h); }).catch(() => continueRender(h)); }, [path, h]);
  return d;
};
export const Sticker: React.FC<{emoji: keyof typeof EMOJI; x: number; y: number; t: number; size?: number; dur?: number; rotate?: number; wiggle?: boolean}> = ({emoji, x, y, t, size = 220, dur = 2, rotate = -8, wiggle = true}) => {
  const f = useCurrentFrame();
  const data = useJson(`emoji/${EMOJI[emoji]}.json`);
  if (f < S(t) || f > S(t + dur) + 8) return null;
  const p = popP(f, t, 10);
  const o = interpolate(f, [S(t + dur), S(t + dur) + 8], [1, 0], clamp);
  const wg = wiggle ? Math.sin((f - S(t)) / 4) * 4 : 0;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${p * (1 - 0.3 * (1 - o))}) rotate(${rotate + wg}deg)`, opacity: o, filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.25))'}}>
      {data && <Lottie animationData={data} loop playbackRate={1} style={{width: size, height: size}} />}
    </div>
  );
};
// Hand-drawn style arrow that draws on and bobs toward its target. dir = where it points.
export const ArrowSticker: React.FC<{x: number; y: number; t: number; dir?: 'down' | 'up' | 'left' | 'right'; size?: number; color?: string; dur?: number}> = ({x, y, t, dir = 'down', size = 200, color = '#E5322D', dur = 2}) => {
  const f = useCurrentFrame();
  if (f < S(t) || f > S(t + dur) + 8) return null;
  const d = interpolate(f, [S(t), S(t) + 12], [1, 0], {...clamp, easing: out});
  const o = interpolate(f, [S(t + dur), S(t + dur) + 8], [1, 0], clamp);
  const bob = Math.sin((f - S(t)) / 5) * 12;
  const rot = {down: 0, up: 180, left: 90, right: -90}[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, opacity: o, transform: `rotate(${rot}deg) translateY(${bob}px)`, overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))'}}>
      <path d="M50 6 C 40 30, 62 52, 50 84" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d} />
      <path d="M30 66 L50 88 L70 64" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={Math.max(0, d * 2 - 0.2)} />
    </svg>
  );
};
