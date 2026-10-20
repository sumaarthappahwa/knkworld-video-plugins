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
const pop = (p: number, from = 0.5) => ({opacity: p, scale: String(interpolate(p, [0, 1], [from, 1]))});

const Sans: React.FC<{size?: number; w?: number; color?: string; children: React.ReactNode}> = ({size = 54, w = 600, color = INK, children}) => (
  <span style={{fontFamily: SANS, fontWeight: w, fontSize: size, color, letterSpacing: -1}}>{children}</span>
);
const Serif: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 110, color = BLUE, children}) => (
  <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color, letterSpacing: -2, lineHeight: 1}}>{children}</span>
);
const Row: React.FC<{y: number; p: number; children: React.ReactNode}> = ({y, p, children}) => (
  <div style={{position: 'absolute', top: y, left: 0, width: 1080, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16, ...rise(p)}}>{children}</div>
);
const Dot: React.FC<{c: string; s?: number}> = ({c, s = 14}) => <div style={{width: s, height: s, borderRadius: 99, background: c}} />;
const Check: React.FC<{p: number; size?: number}> = ({p, size = 44}) => (
  <div style={{width: size, height: size, borderRadius: 12, border: `3px solid ${p > 0 ? BLUE : 'rgba(0,0,0,0.2)'}`, background: p > 0 ? BLUE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: String(interpolate(p, [0, 0.5, 1], [1, 1.15, 1]))}}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - p)} /></svg>
  </div>
);
const Pin: React.FC<{size?: number; color?: string}> = ({size = 40, color = BLUE}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22z" fill={color} /><circle cx="12" cy="9.5" r="2.8" fill="#fff" /></svg>
);
const Pill: React.FC<{dark?: boolean; size?: number; children: React.ReactNode}> = ({dark, size = 30, children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 999, background: dark ? INK : '#fff', color: dark ? '#fff' : INK, fontFamily: SANS, fontWeight: 700, fontSize: size, boxShadow: '0 12px 30px rgba(20,20,40,0.14)'}}>{children}</div>
);
const Browser: React.FC<{src: string; t0: number; t1: number; label: string; children?: React.ReactNode}> = ({src, t0, t1, label, children}) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [S(t0), S(t1)], [1.0, 1.12], clamp);
  return (
    <div style={{position: 'absolute', top: 230, left: 50, width: 980, height: 590, borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 26px 70px rgba(10,15,40,0.3)'}}>
      <div style={{height: 52, background: '#EEF1F6', display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 20}}>
        <Dot c="#FF5F57" /><Dot c="#FEBC2E" /><Dot c="#28C840" />
        <div style={{marginLeft: 20, height: 30, width: 520, borderRadius: 999, background: '#fff', fontFamily: SANS, fontWeight: 500, fontSize: 18, color: 'rgba(21,21,21,0.55)', display: 'flex', alignItems: 'center', paddingLeft: 16}}>{label}</div>
      </div>
      <div style={{width: 980, height: 538, overflow: 'hidden'}}>
        <Video src={staticFile(src)} from={S(t0) - 6} muted style={{width: 980, height: 538, objectFit: 'cover', objectPosition: '50% 15%', scale: String(zoom), transformOrigin: '50% 25%'}} />
      </div>
      {children}
    </div>
  );
};

// 1. Title card (split 760)
export const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.titleIn, C.productIn + 0.15, 1, 6);
  if (v <= 0) return null;
  const chip = popP(f, 1.6, 10);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <div style={{position: 'absolute', top: 70, width: 1080, display: 'flex', justifyContent: 'center', ...rise(inP(f, 0.3))}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 26px rgba(0,0,0,0.08)', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: INK}}>
          <Dot c="#FF9933" /><Dot c="#138808" />&nbsp;EXPORT PRODUCT IDEA
        </div>
      </div>
      <Row y={165} p={inP(f, 0.5)}><Sans size={62} w={700}>Is product ko consider karo</Sans></Row>
      <Row y={255} p={inP(f, 0.8)}><Serif size={116}>Block Print Bandana</Serif></Row>
      <div style={{position: 'absolute', top: 420, width: 1080, display: 'flex', justifyContent: 'center', gap: 16, ...pop(chip, 0.6)}}>
        <Pill dark size={40}>₹40 → ₹1,200</Pill>
        <Pill size={40}><Dot c={BLUE} />UK &amp; Europe</Pill>
      </div>
      <div style={{position: 'absolute', top: 560, left: 340, width: 400, height: 2, background: 'rgba(0,0,0,0.15)', scale: `${inP(f, 2.2, 12)} 1`}} />
      <Row y={590} p={inP(f, 2.4)}><Sans size={40} w={500} color="rgba(21,21,21,0.7)">Low competition</Sans><Serif size={64}>·</Serif><Sans size={40} w={500} color="rgba(21,21,21,0.7)">High margin</Sans></Row>
    </AbsoluteFill>
  );
};

// 2. Product photos (split)
export const Product: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.productIn + 0.05, C.demandIn + 0.1, 6, 5);
  if (v <= 0) return null;
  const a = popP(f, C.block - 0.2, 12), b = popP(f, C.block + 0.25, 12), tag = popP(f, C.scarf, 9);
  const card = (src: string, p: number, x: number, rot: number, label: string) => (
    <div style={{position: 'absolute', left: x, top: 120, padding: 14, paddingBottom: 58, background: '#fff', borderRadius: 10, boxShadow: '0 24px 60px rgba(10,15,40,0.28)', rotate: `${interpolate(p, [0, 1], [rot * 2.5, rot])}deg`, ...pop(p, 0.7)}}>
      <Img src={staticFile(src)} style={{width: 430, height: 560, objectFit: 'cover', borderRadius: 4, display: 'block'}} />
      <div style={{position: 'absolute', bottom: 12, left: 0, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, color: INK}}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: v}}>
      {card('assets/bandana1.jpg', a, 70, -4, 'as a scarf')}
      {card('assets/bandana2.jpg', b, 560, 4, 'as a bandana')}
      <div style={{position: 'absolute', top: 70, width: 1080, display: 'flex', justifyContent: 'center', ...rise(inP(f, C.block))}}>
        <Pill dark size={28}>BLOCK PRINT BANDANA</Pill>
      </div>
      <div style={{position: 'absolute', top: 780, width: 1080, display: 'flex', justifyContent: 'center', ...pop(tag)}}>
        <Pill size={32}>Bandana = Scarf ✓</Pill>
      </div>
    </AbsoluteFill>
  );
};

// 3. Demand in UK & Europe (full) — route arcs from India
export const Demand: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.demandIn, C.demandOut + 0.15, 6, 6);
  if (v <= 0) return null;
  const IN = [800, 1240];
  const arcs = [{to: [250, 860], c: [430, 700], t: C.uk, l: 'UK'}, {to: [470, 1000], c: [620, 840], t: C.europe, l: 'Europe'}];
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={170} p={inP(f, C.demand - 0.2)}><Sans size={60} w={700}>Bahut</Sans><Serif size={170}>demand</Serif></Row>
      <Row y={400} p={inP(f, C.uk)}><Sans size={46} w={500} color="rgba(21,21,21,0.7)">in</Sans><Serif size={110}>UK &amp; Europe</Serif></Row>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {arcs.map((a, i) => {
          const r = interpolate(f, [S(a.t) - 4, S(a.t) + 14], [0, 1], {...clamp, easing: inOut});
          const d = `M ${IN[0]} ${IN[1]} Q ${a.c[0]} ${a.c[1]} ${a.to[0]} ${a.to[1]}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="rgba(47,107,255,0.15)" strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
              <path d={d} fill="none" stroke={BLUE} strokeWidth={6} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - r)} />
              <circle cx={a.to[0]} cy={a.to[1]} r={18 * r} fill={BLUE} />
              <circle cx={a.to[0]} cy={a.to[1]} r={18 + 36 * r} fill="none" stroke={BLUE} strokeOpacity={0.2} strokeWidth={3} />
            </g>
          );
        })}
        <circle cx={IN[0]} cy={IN[1]} r={20} fill={INK} />
      </svg>
      <div style={{position: 'absolute', left: IN[0] - 30, top: IN[1] + 34, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: INK}}>India</div>
      {arcs.map((a, i) => <div key={i} style={{position: 'absolute', left: a.to[0] - 40, top: a.to[1] - 90, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: INK, ...pop(popP(f, a.t + 0.3))}}>{a.l}</div>)}
    </AbsoluteFill>
  );
};

// 4. Retail on Etsy with price tags (split)
const PRICES = [{t: C.p900, l: '₹900'}, {t: C.p1000, l: '₹1,000'}, {t: C.p1200, l: '₹1,200'}];
export const Retail: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.retailIn + 0.1, C.compareIn + 0.15, 6, 6);
  if (v <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: v}}>
      <div style={{position: 'absolute', top: 60, left: 60, display: 'flex', alignItems: 'baseline', gap: 22, ...rise(inP(f, C.retail - 0.2))}}>
        <Serif size={120}>Retail</Serif><Sans size={56} w={700}>price abroad</Sans>
      </div>
      <Browser src="assets/etsy.mp4" t0={C.retailIn} t1={C.compareIn} label="Etsy — block print bandanas">
        <div style={{position: 'absolute', left: 30, bottom: 30, display: 'flex', gap: 16}}>
          {PRICES.map((p, i) => <div key={i} style={pop(popP(f, p.t))}><Pill dark={i < 2} size={40}>{p.l}</Pill></div>)}
        </div>
      </Browser>
    </AbsoluteFill>
  );
};

// 5. Price gap: wholesale India vs retail abroad (split)
export const Compare: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.compareIn, C.sourceIn + 0.15, 6, 6);
  if (v <= 0) return null;
  const lo = popP(f, C.p40, 10), lo2 = popP(f, C.p45, 8);
  const grow = interpolate(f, [S(C.wholesale), S(C.wholesale) + 18], [0, 1], {...clamp, easing: out});
  const gap = popP(f, C.wholesale + 0.5, 12);
  const bar = (h: number, color: string, label: string, price: string, p: number) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 360}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 76, color: color === INK ? INK : BLUE, ...pop(p, 0.6)}}>{price}</div>
      <div style={{width: 200, height: h, borderRadius: 22, background: color, boxShadow: '0 16px 40px rgba(10,15,40,0.18)'}} />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: INK, textAlign: 'center'}}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={50} p={inP(f, C.whereas)}><Sans size={56} w={700}>Whereas</Sans><Serif size={120}>India</Serif><Sans size={56} w={700}>mein</Sans></Row>
      <div style={{position: 'absolute', top: 240, width: 1080, height: 560, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 60}}>
        {bar(40 + 16 * lo2, INK, 'Wholesale · India', lo2 > 0.5 ? '₹40–45' : '₹40', lo)}
        {bar(40 + 340 * grow, BLUE, 'Retail · UK/Europe', '₹900–1,200', grow)}
      </div>
      <div style={{position: 'absolute', top: 470, left: 440, ...pop(gap, 0.4), rotate: '-8deg'}}>
        <div style={{width: 200, height: 200, borderRadius: 999, background: '#fff', border: `4px solid ${BLUE}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 40px rgba(47,107,255,0.3)'}}>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: BLUE, lineHeight: 1}}>20x+</span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: INK}}>PRICE GAP</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 6. Sourcing hubs (split)
const HUBS = [{t: C.jaipur, l: 'Jaipur', s: 'Rajasthan'}, {t: C.gujarat, l: 'Gujarat', s: 'Block print hub'}];
export const Sourcing: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.sourceIn, C.imIn + 0.15, 6, 6);
  if (v <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={60} p={inP(f, C.sourceIn + 0.1)}><Serif size={130}>Source</Serif><Sans size={58} w={700}>karo yahan se</Sans></Row>
      <div style={{position: 'absolute', top: 280, width: 1080, display: 'flex', justifyContent: 'center', gap: 40}}>
        {HUBS.map((h, i) => {
          const p = popP(f, h.t, 10);
          return (
            <div key={i} style={{width: 400, height: 330, borderRadius: 30, background: '#fff', boxShadow: '0 20px 50px rgba(10,15,40,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, ...pop(p, 0.6), translate: `0px ${interpolate(p, [0, 1], [40, 0])}px`}}>
              <Pin size={90} color={i === 0 ? BLUE : INK} />
              <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: INK, lineHeight: 1}}>{h.l}</span>
              <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: 'rgba(21,21,21,0.55)', letterSpacing: 2}}>{h.s.toUpperCase()}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 680, width: 1080, display: 'flex', justifyContent: 'center', ...pop(popP(f, C.hub))}}>
        <Pill dark size={34}>Sabse zyada bikte + aasaani se milte</Pill>
      </div>
    </AbsoluteFill>
  );
};

// 7. IndiaMART suppliers (split)
export const IndiaMart: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.imIn, C.checkIn + 0.2, 6, 6);
  if (v <= 0) return null;
  const enter = interpolate(f, [S(C.imIn) - 4, S(C.imIn) + 8], [1, 0], {...clamp, easing: inOut});
  return (
    <AbsoluteFill style={{opacity: v, translate: `${enter * 1100}px 0px`}}>
      <div style={{position: 'absolute', top: 60, left: 60, display: 'flex', alignItems: 'baseline', gap: 22, ...rise(inP(f, C.imIn + 0.1))}}>
        <Serif size={120}>IndiaMART</Serif><Sans size={56} w={700}>suppliers</Sans>
      </div>
      <Browser src="assets/indiamart.mp4" t0={C.imIn} t1={C.checkIn} label="IndiaMART — cotton bandana suppliers">
        <div style={{position: 'absolute', left: 30, bottom: 30, ...pop(popP(f, C.suppliers))}}><Pill dark size={32}>Contact supplier ✓</Pill></div>
      </Browser>
    </AbsoluteFill>
  );
};

// 8. Why start now (split checklist)
const ITEMS = [{t: C.low, l: 'Low competition'}, {t: C.high, l: 'High margin'}, {t: C.b2b, l: 'B2B orders bhi'}];
export const Checklist: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.checkIn, C.checkOut + 0.15, 6, 6);
  if (v <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={60} p={inP(f, C.checkIn + 0.1)}><Sans size={62} w={700}>Jaldi</Sans><Serif size={140}>shuru karo</Serif></Row>
      {ITEMS.map((it, i) => {
        const p = inP(f, it.t - 0.25, 8);
        const ck = interpolate(f, [S(it.t), S(it.t) + 7], [0, 1], clamp);
        return (
          <div key={i} style={{position: 'absolute', top: 290 + i * 140, left: 110, width: 860, height: 112, borderRadius: 24, background: '#fff', boxShadow: '0 10px 26px rgba(10,15,40,0.1)', display: 'flex', alignItems: 'center', gap: 28, paddingLeft: 32, ...rise(p, 30)}}>
            <Check p={ck} size={52} />
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 50, color: INK}}>{it.l}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 9. CTA (full): difficulty question + comment box + follow
const MSG = 'Top 10 product videos chahiye!';
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.ctaIn, C.end + 1, 6, 1);
  if (v <= 0) return null;
  const chars = Math.round(interpolate(f, [S(C.typeStart), S(C.typeEnd)], [0, MSG.length], clamp));
  const caret = chars < MSG.length && Math.floor(f / 8) % 2 === 0;
  const done = f >= S(C.typeEnd);
  const card = inP(f, C.comment - 0.2, 10);
  const fol = popP(f, C.followBtn, 12);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Row y={230} p={inP(f, C.ctaIn + 0.1)}><Sans size={58} w={600}>Product dhoondhne mein</Sans></Row>
      <Row y={320} p={popP(f, C.difficulty, 10)}><Serif size={150}>kya difficulty?</Serif></Row>
      <Row y={560} p={card}><Sans size={40} w={600} color="rgba(21,21,21,0.6)">Comment mein batao ↓</Sans></Row>
      <div style={{position: 'absolute', top: 650, left: 70, width: 940, borderRadius: 28, background: '#fff', boxShadow: '0 24px 60px rgba(10,15,40,0.16)', padding: 30, display: 'flex', alignItems: 'center', gap: 22, ...rise(card, 40)}}>
        <div style={{width: 76, height: 76, borderRadius: 99, background: `linear-gradient(135deg, ${BLUE}, #9DB8FF)`, flexShrink: 0}} />
        <div style={{flex: 1, minHeight: 60, borderRadius: 18, background: '#F3F4F7', display: 'flex', alignItems: 'center', padding: '10px 22px', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: INK}}>
          {MSG.slice(0, chars) || <span style={{color: 'rgba(21,21,21,0.35)'}}>Add a comment…</span>}{caret && <span style={{color: BLUE}}>|</span>}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: done ? BLUE : 'rgba(47,107,255,0.35)'}}>Post</div>
      </div>
      <div style={{position: 'absolute', top: 920, width: 1080, display: 'flex', justifyContent: 'center', ...pop(fol), scale: String(interpolate(fol, [0, 1], [0.5, 1]) * (f > S(C.followBtn) + 12 ? 1 + 0.03 * Math.sin((f - S(C.followBtn)) / 4) : 1))}}>
        <div style={{padding: '26px 56px', borderRadius: 999, background: BLUE, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 46, boxShadow: '0 18px 44px rgba(47,107,255,0.4)'}}>＋ Follow for more ideas</div>
      </div>
    </AbsoluteFill>
  );
};

// Follow nudge over A-roll
export const FollowShare: React.FC = () => {
  const f = useCurrentFrame();
  const v = win(f, C.interesting, C.ctaIn - 0.1, 4, 6);
  if (v <= 0) return null;
  const isFollow = f >= S(C.follow);
  const p = isFollow ? popP(f, C.follow, 10) : popP(f, C.interesting, 10);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <div style={{position: 'absolute', top: 170, width: 1080, display: 'flex', justifyContent: 'center', ...pop(p)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 40px', borderRadius: 999, background: isFollow ? BLUE : '#fff', color: isFollow ? '#fff' : INK, fontFamily: SANS, fontWeight: 800, fontSize: 42, boxShadow: '0 16px 40px rgba(0,0,0,0.3)'}}>
          {isFollow ? '＋ Follow' : 'Daily export product ideas'}
        </div>
      </div>
    </AbsoluteFill>
  );
};
