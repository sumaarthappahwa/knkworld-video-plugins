import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Video} from '@remotion/media';
import {C} from './cues';
import {S, INK, BLUE, SANS, SERIF, inOut, out, clamp} from './theme';

const spring = Easing.bezier(0.34, 1.56, 0.64, 1);
const win = (f: number, a: number, b: number, fi = 6, fo = 6) => interpolate(f, [S(a), S(a) + fi, S(b) - fo, S(b)], [0, 1, 1, 0], clamp);
const popP = (f: number, t: number, d = 9) => interpolate(f, [S(t), S(t) + d], [0, 1], {...clamp, easing: spring});
const inP = (f: number, t: number, d = 10) => interpolate(f, [S(t), S(t) + d], [0, 1], {...clamp, easing: out});
const rise = (p: number, dist = 24) => ({opacity: p, translate: `0px ${interpolate(p, [0, 1], [dist, 0])}px`, filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`});

const Sans: React.FC<{size?: number; w?: number; color?: string; children: React.ReactNode}> = ({size = 54, w = 600, color = INK, children}) => (
  <span style={{fontFamily: SANS, fontWeight: w, fontSize: size, color, letterSpacing: -1}}>{children}</span>
);
const Serif: React.FC<{size?: number; children: React.ReactNode}> = ({size = 110, children}) => (
  <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color: BLUE, letterSpacing: -2, lineHeight: 1}}>{children}</span>
);
const Row: React.FC<{y: number; p: number; children: React.ReactNode}> = ({y, p, children}) => (
  <div style={{position: 'absolute', top: y, left: 0, width: 1080, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16, ...rise(p)}}>{children}</div>
);
const Dot: React.FC<{c: string}> = ({c}) => <div style={{width: 14, height: 14, borderRadius: 99, background: c}} />;
const Check: React.FC<{p: number; size?: number}> = ({p, size = 44}) => (
  <div style={{width: size, height: size, borderRadius: 12, border: `3px solid ${p > 0 ? BLUE : 'rgba(0,0,0,0.2)'}`, background: p > 0 ? BLUE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: String(interpolate(p, [0, 0.5, 1], [1, 1.15, 1]))}}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - p)} /></svg>
  </div>
);
const Plane: React.FC<{size?: number; color?: string}> = ({size = 40, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M3 11.5L21 3l-6.5 18-3.2-7.3L3 11.5z" fill={color} /><path d="M11.3 13.7L21 3" stroke={BLUE} strokeWidth={1.4} /></svg>
);

// ---------------- 1. Title card (split, first ~6 s) ----------------
export const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.titleIn, C.leadersIn + 0.15, 1, 6);
  if (v <= 0) return null;
  const dateP = popP(f, 1.55, 10);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <div style={{position: 'absolute', top: 70, width: 1080, display: 'flex', justifyContent: 'center', ...rise(inP(f, 0.3))}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 26px rgba(0,0,0,0.08)', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: INK}}>
          <Dot c="#FF9933" /><Dot c="#138808" />&nbsp;INDIA × NEW ZEALAND&nbsp;<Dot c="#00247D" /><Dot c="#CC142B" />
        </div>
      </div>
      <Row y={160} p={inP(f, 0.5)}><Sans size={62} w={700}>India–New Zealand FTA</Sans></Row>
      <Row y={240} p={inP(f, 0.8)}><Serif size={150}>Goes Live</Serif></Row>
      <div style={{position: 'absolute', top: 410, width: 1080, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: dateP, scale: String(interpolate(dateP, [0, 1], [0.6, 1]))}}>
        <Sans size={46} w={600}>on</Sans>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 30px', borderRadius: 20, background: INK, boxShadow: '0 14px 34px rgba(0,0,0,0.25)'}}>
          <svg width="40" height="40" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="#fff" strokeWidth="2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: '#fff', letterSpacing: 2}}>20 OCTOBER</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 545, left: 340, width: 400, height: 2, background: 'rgba(0,0,0,0.15)', scale: `${inP(f, 2.2, 12)} 1`}} />
      <Row y={570} p={inP(f, 2.3)}><Sans size={38} w={500} color="rgba(21,21,21,0.7)">Your Step-by-Step</Sans></Row>
      <Row y={622} p={inP(f, 2.55)}><Serif size={78}>Export Opportunity Plan</Serif></Row>
    </AbsoluteFill>
  );
};

// ---------------- 2. Leaders photo + news headline (split) ----------------
export const Leaders: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.leadersIn + 0.05, C.fullIn + 0.1, 6, 5);
  if (v <= 0) return null;
  const photo = popP(f, C.leadersIn + 0.15, 12);
  const news = interpolate(f, [S(C.fta), S(C.fta) + 10], [0, 1], {...clamp, easing: out});
  const stamp = popP(f, C.execute, 9);
  const kb = interpolate(f, [S(C.leadersIn), S(C.fullIn)], [1, 1.06], clamp);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <div style={{position: 'absolute', top: 60, width: 1080, display: 'flex', justifyContent: 'center', ...rise(inP(f, C.leadersIn + 0.2))}}>
        <div style={{padding: '12px 26px', borderRadius: 999, background: INK, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 3}}>INDIA – NEW ZEALAND FTA</div>
      </div>
      {/* polaroid photo */}
      <div style={{position: 'absolute', left: 90, top: 140, padding: 16, paddingBottom: 60, background: '#fff', borderRadius: 10, boxShadow: '0 24px 60px rgba(10,15,40,0.28)', rotate: `${interpolate(photo, [0, 1], [-10, -4])}deg`, opacity: photo, scale: String(interpolate(photo, [0, 1], [0.7, 1]))}}>
        <div style={{width: 600, height: 555, overflow: 'hidden', borderRadius: 4}}>
          <Img src={staticFile('assets/leaders.jpg')} style={{width: 600, height: 555, objectFit: 'cover', scale: String(kb)}} />
        </div>
        <div style={{position: 'absolute', bottom: 14, left: 0, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 36, color: INK}}>India × New Zealand</div>
      </div>
      {/* news card */}
      <div style={{position: 'absolute', left: 240, top: 560, width: 800, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 60px rgba(10,15,40,0.3)', rotate: '2deg', opacity: news, translate: `${interpolate(news, [0, 1], [700, 0])}px 0px`}}>
        <Img src={staticFile('assets/news.png')} style={{width: 800, display: 'block'}} />
      </div>
      {/* effective stamp */}
      <div style={{position: 'absolute', left: 780, top: 120, width: 210, height: 210, borderRadius: 999, background: BLUE, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 40px rgba(47,107,255,0.45)', rotate: '-12deg', opacity: stamp, scale: String(interpolate(stamp, [0, 1], [1.8, 1]))}}>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 3}}>IN FORCE</span>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, lineHeight: 1}}>20 Oct</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 3. 100% free entry + route (full) ----------------
export const FreeEntry: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.fullIn, C.fullOut + 0.15, 6, 6);
  if (v <= 0) return null;
  const n = Math.round(interpolate(f, [S(C.hundred), S(C.hundred) + 18], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)}));
  const route = interpolate(f, [S(C.fullIn) + 8, S(C.nz) + 6], [0, 1], {...clamp, easing: inOut});
  // quadratic bezier from India to NZ
  const P0 = [200, 1180], P1 = [540, 760], P2 = [880, 1300];
  const at = (t: number) => [(1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0], (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
  const [px, py] = at(route);
  const len = 1100;
  const nzP = popP(f, C.nz, 10);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <div style={{position: 'absolute', top: 150, width: 1080, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 300, color: BLUE, lineHeight: 1, opacity: popP(f, C.hundred, 8), textShadow: '0 24px 60px rgba(47,107,255,0.25)'}}>{n}%</div>
      <Row y={480} p={inP(f, C.freeEntry)}><Sans size={70} w={800}>FREE ENTRY</Sans></Row>
      <Row y={570} p={inP(f, C.nz)}><Sans size={44} w={500} color="rgba(21,21,21,0.7)">into</Sans><Serif size={100}>New Zealand</Serif></Row>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke="rgba(47,107,255,0.18)" strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
        <path d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke={BLUE} strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - route)} />
        <circle cx={P0[0]} cy={P0[1]} r={18} fill={INK} />
        <circle cx={P2[0]} cy={P2[1]} r={18 * nzP} fill={BLUE} />
        <circle cx={P2[0]} cy={P2[1]} r={18 + 40 * nzP} fill="none" stroke={BLUE} strokeOpacity={0.4 * (1 - nzP) + 0.15} strokeWidth={3} />
      </svg>
      <div style={{position: 'absolute', left: px - 26, top: py - 26, width: 52, height: 52, borderRadius: 99, background: '#fff', boxShadow: '0 8px 22px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: route > 0 && route < 1 ? 1 : 0}}><Plane size={30} color={BLUE} /></div>
      <div style={{position: 'absolute', left: 120, top: 1220, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: INK}}>India</div>
      <div style={{position: 'absolute', left: 700, top: 1345, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: INK, opacity: nzP}}>New Zealand</div>
    </AbsoluteFill>
  );
};

// ---------------- 4. 10 websites + reach chain (split) ----------------
const CHAIN = [{t: C.retailer, l: 'Retailer'}, {t: C.wholesaler, l: 'Wholesaler'}, {t: C.distributor, l: 'Distributor'}];
export const TenWebsites: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.webIn, C.webOut + 0.15, 6, 6);
  if (v <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={50} p={popP(f, C.ten, 10)}><Serif size={170}>10</Serif><Sans size={64} w={700}>websites</Sans></Row>
      <div style={{position: 'absolute', top: 250, left: 117, display: 'grid', gridTemplateColumns: 'repeat(5, 150px)', gap: 24}}>
        {Array.from({length: 10}).map((_, i) => {
          const p = popP(f, C.ten + 0.25 + i * 0.06, 8);
          const ck = interpolate(f, [S(C.register) + i * 2, S(C.register) + i * 2 + 6], [0, 1], clamp);
          return (
            <div key={i} style={{width: 150, height: 96, borderRadius: 14, background: '#fff', boxShadow: '0 10px 24px rgba(10,15,40,0.12)', overflow: 'hidden', opacity: p, scale: String(interpolate(p, [0, 1], [0.6, 1])), position: 'relative'}}>
              <div style={{height: 20, background: '#EEF1F6', display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 8}}><Dot c="#FF5F57" /><Dot c="#FEBC2E" /><Dot c="#28C840" /></div>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, color: i < 5 ? BLUE : 'rgba(21,21,21,0.35)', paddingLeft: 12, lineHeight: 1.4}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{position: 'absolute', right: 8, bottom: 8}}><Check p={ck} size={30} /></div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 520, width: 1080, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
        {CHAIN.map((c, i) => {
          const p = popP(f, c.t, 9);
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: BLUE, opacity: p}}>→</div>}
              <div style={{padding: '20px 30px', borderRadius: 999, background: i === 2 ? BLUE : '#fff', color: i === 2 ? '#fff' : INK, boxShadow: '0 12px 30px rgba(20,20,40,0.13)', fontFamily: SANS, fontWeight: 700, fontSize: 36, opacity: p, scale: String(interpolate(p, [0, 1], [0.5, 1]))}}>{c.l}</div>
            </React.Fragment>
          );
        })}
      </div>
      <Row y={660} p={inP(f, C.reach)}><Sans size={48} w={600}>Reach across</Sans><Serif size={110}>New Zealand</Serif></Row>
    </AbsoluteFill>
  );
};

// ---------------- 5. The five websites (split, screen recordings) ----------------
const SITES: {n: string; name: string; src: string; t0: number; t1: number; tags: {t: number; l: string}[]; skip?: number}[] = [
  {n: '01', name: 'Foodstuffs', src: 'assets/site1.mp4', t0: C.sitesIn, t1: C.sw2, tags: [{t: C.supplier, l: 'Become a supplier'}, {t: C.form, l: 'Fill up the form ✓'}]},
  {n: '02', name: 'Woolworths', src: 'assets/site2.mp4', t0: C.sw2, t1: C.sw3, tags: [{t: C.partner, l: 'Become a partner'}]},
  {n: '03', name: 'The Warehouse Group', src: 'assets/site3.mp4', t0: C.sw3, t1: C.sw4, tags: [{t: C.registerThere, l: 'Register on Supplier Centre'}]},
  {n: '04', name: 'Mitre 10', src: 'assets/site4.mp4', t0: C.sw4, t1: C.sw5, tags: []},
  {n: '05', name: 'Briscoe Group', src: 'assets/site5.mp4', t0: C.sw5, t1: C.checkIn, tags: [], skip: 1.9},
];
const SiteView: React.FC<{s: (typeof SITES)[number]; idx: number}> = ({s, idx}) => {
  const f = useCurrentFrame();
  const first = idx === 0, last = idx === SITES.length - 1;
  const enter = first ? 0 : interpolate(f, [S(s.t0) - 6, S(s.t0) + 6], [1, 0], {...clamp, easing: inOut});
  const exit = last ? interpolate(f, [S(s.t1) - 6, S(s.t1) + 4], [0, 1], clamp) : interpolate(f, [S(s.t1) - 6, S(s.t1) + 6], [0, 1], {...clamp, easing: inOut});
  if (f < S(s.t0) - 6 || f > S(s.t1) + 6) return null;
  const head = inP(f, s.t0 + 0.05, 10);
  const zoom = interpolate(f, [S(s.t0), S(s.t1)], [1.0, 1.12], clamp);
  return (
    <AbsoluteFill style={{translate: `${(enter - (last ? 0 : exit)) * 1100}px 0px`, opacity: last ? 1 - exit : 1}}>
      <div style={{position: 'absolute', top: 60, left: 60, display: 'flex', alignItems: 'baseline', gap: 22, ...rise(head)}}>
        <Serif size={120}>{s.n}</Serif>
        <Sans size={60} w={700}>{s.name}</Sans>
      </div>
      <div style={{position: 'absolute', top: 230, left: 50, width: 980, height: 590, borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 26px 70px rgba(10,15,40,0.3)'}}>
        <div style={{height: 52, background: '#EEF1F6', display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 20}}>
          <Dot c="#FF5F57" /><Dot c="#FEBC2E" /><Dot c="#28C840" />
          <div style={{marginLeft: 20, height: 30, width: 520, borderRadius: 999, background: '#fff', fontFamily: SANS, fontWeight: 500, fontSize: 18, color: 'rgba(21,21,21,0.55)', display: 'flex', alignItems: 'center', paddingLeft: 16}}>{s.name} — supplier page</div>
        </div>
        <div style={{width: 980, height: 538, overflow: 'hidden'}}>
          <Video src={staticFile(s.src)} from={S(s.t0) - 6} trimBefore={Math.round((s.skip ?? 0) * 30)} muted style={{width: 980, height: 538, objectFit: 'cover', objectPosition: '50% 20%', scale: String(zoom), transformOrigin: '50% 30%'}} />
        </div>
        {s.tags.map((tg, i) => {
          const p = popP(f, tg.t, 9);
          return <div key={i} style={{position: 'absolute', left: 30 + i * 340, bottom: 30, padding: '16px 26px', borderRadius: 999, background: i === 0 ? BLUE : INK, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 30, boxShadow: '0 12px 30px rgba(0,0,0,0.3)', opacity: p, scale: String(interpolate(p, [0, 1], [0.5, 1]))}}>{tg.l}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
export const Sites: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.sitesIn, C.checkIn + 0.25, 6, 6);
  if (v <= 0) return null;
  let active = 0;
  SITES.forEach((s, i) => { if (f >= S(s.t0)) active = i; });
  return (
    <AbsoluteFill style={{opacity: v}}>
      {SITES.map((s, i) => <SiteView key={i} s={s} idx={i} />)}
      <div style={{position: 'absolute', top: 845, width: 1080, display: 'flex', justifyContent: 'center', gap: 12}}>
        {SITES.map((_, i) => <div key={i} style={{width: i === active ? 42 : 14, height: 14, borderRadius: 99, background: i <= active ? BLUE : 'rgba(0,0,0,0.18)'}} />)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 6. Prep checklist (split) ----------------
const ITEMS = [{t: C.moq, l: 'MOQ', sub: 'Minimum Order Quantity'}, {t: C.products, l: 'Products'}, {t: C.compliances, l: 'Compliances'}, {t: C.catalogue, l: 'Catalogue'}];
export const Checklist: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.checkIn, C.ctaIn + 0.15, 6, 6);
  if (v <= 0) return null;
  const moqGlow = interpolate(f, [S(C.withMoq), S(C.withMoq) + 8], [0, 1], clamp);
  const send = popP(f, C.send, 10);
  const fly = interpolate(f, [S(C.send) + 4, S(C.send) + 18], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={50} p={inP(f, C.checkIn + 0.05)}><Serif size={130}>Prepare</Serif><Sans size={60} w={700}>karo</Sans></Row>
      {ITEMS.map((it, i) => {
        const p = inP(f, it.t - 0.25, 8);
        const ck = interpolate(f, [S(it.t), S(it.t) + 7], [0, 1], clamp);
        const glow = i === 0 ? moqGlow : 0;
        return (
          <div key={i} style={{position: 'absolute', top: 225 + i * 118, left: 110, width: 860, height: 100, borderRadius: 22, background: '#fff', border: `3px solid ${glow ? `rgba(47,107,255,${glow})` : 'transparent'}`, boxShadow: glow ? '0 16px 40px rgba(47,107,255,0.3)' : '0 10px 26px rgba(10,15,40,0.1)', display: 'flex', alignItems: 'center', gap: 26, paddingLeft: 28, ...rise(p, 30)}}>
            <Check p={ck} />
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, color: INK}}>{it.l}</span>
            {it.sub && <span style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: BLUE, opacity: glow}}>{it.sub}</span>}
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 718, width: 1080, display: 'flex', justifyContent: 'center', opacity: send, scale: String(interpolate(send, [0, 1], [0.6, 1]))}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 40px', borderRadius: 999, background: BLUE, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 40, boxShadow: '0 16px 40px rgba(47,107,255,0.4)'}}>
          Bhej do
          <div style={{translate: `${fly * 420}px ${-fly * 260}px`, rotate: `${fly * 20}deg`, opacity: 1 - fly * 0.9}}><Plane size={44} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 7. Comment CTA (full) ----------------
const MSG = 'YES, I want to export to New Zealand';
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.ctaIn, C.end + 1, 6, 1);
  if (v <= 0) return null;
  const chars = Math.round(interpolate(f, [S(C.typeStart), S(C.typeEnd)], [0, MSG.length], clamp));
  const typed = MSG.slice(0, chars);
  const caret = chars < MSG.length && Math.floor(f / 8) % 2 === 0;
  const done = f >= S(C.typeEnd);
  const card = inP(f, C.comment - 0.2, 10);
  const dm = popP(f, C.dm, 12);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={230} p={inP(f, C.ctaIn + 0.1)}><Sans size={60} w={600}>Baaki websites ki</Sans></Row>
      <Row y={320} p={popP(f, C.list, 10)}><Serif size={160}>list chahiye?</Serif></Row>
      <Row y={560} p={card}><Sans size={40} w={600} color="rgba(21,21,21,0.6)">Comment karo ↓</Sans></Row>
      <div style={{position: 'absolute', top: 650, left: 70, width: 940, borderRadius: 28, background: '#fff', boxShadow: '0 24px 60px rgba(10,15,40,0.16)', padding: 30, display: 'flex', alignItems: 'center', gap: 22, ...rise(card, 40)}}>
        <div style={{width: 76, height: 76, borderRadius: 99, background: `linear-gradient(135deg, ${BLUE}, #9DB8FF)`, flexShrink: 0}} />
        <div style={{flex: 1, minHeight: 60, borderRadius: 18, background: '#F3F4F7', display: 'flex', alignItems: 'center', padding: '10px 22px', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: INK}}>
          {typed || <span style={{color: 'rgba(21,21,21,0.35)'}}>Add a comment…</span>}{caret && <span style={{color: BLUE}}>|</span>}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: done ? BLUE : 'rgba(47,107,255,0.35)'}}>Post</div>
      </div>
      <div style={{position: 'absolute', top: 900, right: 90, display: 'flex', alignItems: 'center', gap: 16, padding: '24px 34px', borderRadius: 30, borderBottomRightRadius: 8, background: BLUE, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 40, boxShadow: '0 18px 44px rgba(47,107,255,0.4)', opacity: dm, scale: String(interpolate(dm, [0, 1], [0.5, 1])), transformOrigin: '100% 100%'}}>
        <Plane size={40} />DM aa jayega
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Follow / Share nudges over the A-roll ----------------
export const FollowShare: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.follow - 0.1, C.sitesIn - 0.2, 4, 6);
  if (v <= 0) return null;
  const isShare = f >= S(C.share);
  const p = isShare ? popP(f, C.share, 10) : popP(f, C.follow, 10);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <div style={{position: 'absolute', top: 170, width: 1080, display: 'flex', justifyContent: 'center', opacity: p, scale: String(interpolate(p, [0, 1], [0.5, 1]))}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 40px', borderRadius: 999, background: isShare ? '#fff' : BLUE, color: isShare ? INK : '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 42, boxShadow: '0 16px 40px rgba(0,0,0,0.3)'}}>
          {isShare ? <><Plane size={40} color={BLUE} />Share this reel</> : <>＋ Follow</>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
