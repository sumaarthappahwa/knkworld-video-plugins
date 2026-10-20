// CreamStage 3D Globe — accurate orthographic Earth (Natural Earth 50m, public domain) in pure SVG.
// Spins to the origin country, zooms, highlights countries, draws lifted great-circle routes with labels.
import React, {useEffect, useMemo, useState} from 'react';
import {interpolate, staticFile, useCurrentFrame, delayRender, continueRender, Easing} from 'remotion';
import {S, INK, BLUE, SANS, clamp} from './theme';

type Country = {n: string; c: [number, number]; r: number[][]};
type World = Record<string, Country>;
const useGlobe = () => {
  const [d, setD] = useState<World | null>(null);
  const [h] = useState(() => delayRender('globe data'));
  useEffect(() => { fetch(staticFile('data/globe.json')).then((r) => r.json()).then((j) => { setD(j); continueRender(h); }); }, [h]);
  return d;
};
const RAD = Math.PI / 180;
const vec = (lon: number, lat: number): [number, number, number] => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const spring = Easing.bezier(0.34, 1.56, 0.64, 1);

export type GlobeTheme = 'cream' | 'night';
const TH = {
  cream: {ocean0: '#EAF1F8', ocean1: '#BFD3EA', land: '#FBF8F1', stroke: '#9FB0C4', grat: 'rgba(60,90,140,0.12)', glow: 'rgba(47,107,255,0.18)', from: INK, to: BLUE, arc: BLUE, label: '#fff', labelText: INK},
  night: {ocean0: '#16305C', ocean1: '#081530', land: '#2C4470', stroke: '#4E6B9E', grat: 'rgba(150,180,255,0.10)', glow: 'rgba(120,170,255,0.35)', from: '#FFC928', to: '#7EA6FF', arc: '#FFC928', label: 'rgba(10,20,40,0.85)', labelText: '#fff'},
};

export const Globe3D: React.FC<{
  from: string; to?: {iso: string; label?: string; t: number}[]; t: number; fromLabel?: string;
  size?: number; zoom?: [number, number]; spin?: number; theme?: GlobeTheme; settle?: number;
}> = ({from, to = [], t, fromLabel, size = 900, zoom = [1, 1.25], spin = 160, theme = 'cream', settle = 1.8}) => {
  const f = useCurrentFrame();
  const W = useGlobe();
  const T = TH[theme];
  const rings = useMemo(() => {
    if (!W) return [];
    const out: {iso: string; v: Float32Array}[] = [];
    for (const iso of Object.keys(W)) for (const r of W[iso].r) {
      const v = new Float32Array((r.length / 2) * 3);
      for (let i = 0; i < r.length / 2; i++) { const p = vec(r[i * 2], r[i * 2 + 1]); v[i * 3] = p[0]; v[i * 3 + 1] = p[1]; v[i * 3 + 2] = p[2]; }
      out.push({iso, v});
    }
    return out;
  }, [W]);
  if (!W || !W[from]) return null;
  // camera: spin in to the origin, then follow each route (look at the midpoint origin→destination)
  const [oLon, oLat] = W[from].c;
  const p1 = interpolate(f, [S(t), S(t + settle)], [0, 1], {...clamp, easing: ease});
  const wrap = (d: number) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);
  let lon0 = oLon - spin * (1 - p1), lat0 = interpolate(p1, [0, 1], [8, oLat * 0.7]);
  let curLon = oLon, curLat = oLat * 0.7, zMul = 1;
  for (const x of to) {
    if (!W[x.iso]) continue;
    const q = interpolate(f, [S(x.t - 0.35), S(x.t + 0.75)], [0, 1], {...clamp, easing: ease});
    if (q <= 0) break;
    const [dl, dt] = W[x.iso].c;
    const a = vec(oLon, oLat), b = vec(dl, dt);
    const m = [a[0] + b[0], a[1] + b[1], a[2] + b[2]], ml = Math.hypot(m[0], m[1], m[2]) || 1;
    const tLon = Math.atan2(m[1], m[0]) / RAD, tLat = Math.asin(m[2] / ml) / RAD;
    const ang = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])) / RAD;
    lon0 = curLon + wrap(tLon - curLon) * q; lat0 = curLat + (tLat - curLat) * q;
    zMul = zMul + (Math.max(0.78, 1.05 - ang / 260) - zMul) * q;
    curLon = lon0; curLat = lat0;
  }
  const z = interpolate(p1, [0, 1], [zoom[0], zoom[1]]) * zMul;
  const R = (size / 2) * z * 0.92, cx = size / 2, cy = size / 2;
  const l = lon0 * RAD, ph = lat0 * RAD;
  const c = [Math.cos(ph) * Math.cos(l), Math.cos(ph) * Math.sin(l), Math.sin(ph)];
  const e = [-Math.sin(l), Math.cos(l), 0];
  const n = [-Math.sin(ph) * Math.cos(l), -Math.sin(ph) * Math.sin(l), Math.cos(ph)];
  const proj = (x: number, y: number, zz: number) => {
    let sx = x * e[0] + y * e[1] + zz * e[2], sy = x * n[0] + y * n[1] + zz * n[2];
    const d = x * c[0] + y * c[1] + zz * c[2];
    if (d < 0) { const k = Math.hypot(sx, sy) || 1; sx /= k; sy /= k; }
    return [cx + R * sx, cy - R * sy, d] as const;
  };
  const hiFrom = from, hiTo = new Set(to.filter((x) => f >= S(x.t)).map((x) => x.iso));
  const paths: Record<string, string> = {};
  for (const {iso, v} of rings) {
    let s = '', vis = 0;
    for (let i = 0; i < v.length; i += 3) {
      const [x, y, d] = proj(v[i], v[i + 1], v[i + 2]);
      if (d > 0.02) vis++;
      s += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    if (vis / (v.length / 3) >= 0.45) paths[iso] = (paths[iso] || '') + s + 'Z';
  }
  const grat: string[] = [];
  for (let lo = -180; lo < 180; lo += 30) { let s = ''; let started = false; for (let la = -85; la <= 85; la += 5) { const p = vec(lo, la); const [x, y, d] = proj(...p); if (d > 0) { s += (started ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); started = true; } else started = false; } grat.push(s); }
  for (let la = -60; la <= 60; la += 30) { let s = ''; let started = false; for (let lo = -180; lo <= 180; lo += 5) { const p = vec(lo, la); const [x, y, d] = proj(...p); if (d > 0) { s += (started ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); started = true; } else started = false; } grat.push(s); }
  const appear = interpolate(f, [S(t), S(t) + 12], [0, 1], {...clamp, easing: spring});
  const A = vec(oLon, oLat);
  const arcs = to.filter((x) => W[x.iso]).map((x) => {
    const B = vec(...W[x.iso].c);
    const ang = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    const p = interpolate(f, [S(x.t), S(x.t) + 22], [0, 1], {...clamp, easing: ease});
    const pts: string[] = []; let head: readonly [number, number, number] | null = null; let pen = false;
    const N = 48;
    for (let k = 0; k <= Math.round(N * p); k++) {
      const u = k / N, sa = Math.sin(ang) || 1;
      const w1 = Math.sin((1 - u) * ang) / sa, w2 = Math.sin(u * ang) / sa;
      const lift = 1 + 0.07 * Math.min(1, ang) * Math.sin(Math.PI * u);
      const q = [(w1 * A[0] + w2 * B[0]) * lift, (w1 * A[1] + w2 * B[1]) * lift, (w1 * A[2] + w2 * B[2]) * lift];
      const sx = q[0] * e[0] + q[1] * e[1] + q[2] * e[2], sy = q[0] * n[0] + q[1] * n[1] + q[2] * n[2], dd = q[0] * c[0] + q[1] * c[1] + q[2] * c[2];
      const front = dd > 0 || Math.hypot(sx, sy) > 1.0;
      if (!front) { head = null; pen = false; continue; }
      head = [cx + R * sx, cy - R * sy, dd] as const;
      pts.push((pen ? 'L' : 'M') + head[0].toFixed(1) + ' ' + head[1].toFixed(1)); pen = true;
    }
    return {d: pts.join(''), head, p, x};
  });
  const label = (iso: string, txt: string, tt: number, isFrom: boolean) => {
    const [x, y, d] = proj(...vec(...W[iso].c));
    if (d < 0.15) return null;
    const pp = interpolate(f, [S(tt), S(tt) + 10], [0, 1], {...clamp, easing: spring});
    const pulse = (f / 30) % 1.2;
    return (
      <g key={iso + 'l'} opacity={pp}>
        {isFrom && <circle cx={x} cy={y} r={10 + pulse * 40} fill="none" stroke={T.from} strokeWidth={3} opacity={Math.max(0, 1 - pulse)} />}
        <circle cx={x} cy={y} r={9} fill={isFrom ? T.from : T.to} stroke="#fff" strokeWidth={3} />
        <g transform={`translate(${x}, ${y - 34}) scale(${pp})`}>
          <rect x={-txt.length * 10.5 - 18} y={-26} width={txt.length * 21 + 36} height={46} rx={23} fill={T.label} stroke={isFrom ? T.from : T.to} strokeWidth={2} />
          <text x={0} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={T.labelText}>{txt}</text>
        </g>
      </g>
    );
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow: 'visible', opacity: Math.min(1, appear * 1.4), transform: `scale(${interpolate(appear, [0, 1], [0.7, 1])})`}}>
      <defs>
        <radialGradient id={`oc${theme}`} cx="38%" cy="32%" r="75%"><stop offset="0%" stopColor={T.ocean0} /><stop offset="100%" stopColor={T.ocean1} /></radialGradient>
        <radialGradient id={`gl${theme}`} cx="50%" cy="50%" r="50%"><stop offset="80%" stopColor={T.glow} /><stop offset="100%" stopColor="rgba(0,0,0,0)" /></radialGradient>
        <radialGradient id={`sh${theme}`} cx="35%" cy="30%" r="80%"><stop offset="55%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(10,20,50,0.28)" /></radialGradient>
        <clipPath id={`cp${theme}`}><circle cx={cx} cy={cy} r={R} /></clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={R * 1.12} fill={`url(#gl${theme})`} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#oc${theme})`} />
      <g clipPath={`url(#cp${theme})`}>
        {grat.map((d, i) => <path key={i} d={d} fill="none" stroke={T.grat} strokeWidth={1.5} />)}
        {Object.entries(paths).map(([iso, d]) => (
          <path key={iso} d={d} fill={iso === hiFrom ? T.from : hiTo.has(iso) ? T.to : T.land} stroke={T.stroke} strokeWidth={0.8} strokeLinejoin="round" />
        ))}
        <circle cx={cx} cy={cy} r={R} fill={`url(#sh${theme})`} />
      </g>
      {arcs.map(({d, head, p, x}) => (
        <g key={x.iso}>
          <path d={d} fill="none" stroke={T.arc} strokeWidth={5} strokeLinecap="round" opacity={0.95} />
          {head && p < 1 && <circle cx={head[0]} cy={head[1]} r={9} fill={T.arc} stroke="#fff" strokeWidth={3} />}
        </g>
      ))}
      {label(from, fromLabel ?? W[from].n, t + settle * 0.7, true)}
      {to.map((x) => W[x.iso] && label(x.iso, x.label ?? W[x.iso].n, x.t + 0.6, false))}
    </svg>
  );
};
