import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile} from 'remotion';
import {Video} from '@remotion/media';
import {CREAM, INK, SANS, SERIF, BLUE} from './theme';
import {TextBehind, KineticHook, RouteMap, Counter, BarChart, LineChart, PhoneMockup, LaptopMockup, CircleMark, HighlightMark, UnderlineMark, ArrowMark, PipBubble, BeforeAfterWipe, FilmLook, Sticker, ArrowSticker} from './Effects';
const Stage: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: CREAM, alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>;
const T: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', top: 120, width: 1080, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 54, color: INK}}>{children}</div>;
export const Demo = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={840} durationInFrames={90}><Video src={staticFile('aroll.mp4')} muted style={{width: 1080, height: 1920}} /><TextBehind text="20x MARGIN" fg="fg_test.webm" from={0} t={0.1} /></Sequence>
    <Sequence from={0} durationInFrames={90}><KineticHook word="20x MARGIN" sub="on one product" t={0.1} /></Sequence>
    <Sequence from={90} durationInFrames={120}><Stage><T>Export routes</T><div style={{position: 'absolute', top: 300}}><RouteMap from="IND" fromLabel="India" to={[{iso: 'GBR', label: 'UK', t: 1.2}, {iso: 'DEU', label: 'Germany', t: 1.6}, {iso: 'ARE', label: 'UAE', t: 2.0}]} t={0.1} height={1200} /></div></Stage></Sequence>
    <Sequence from={210} durationInFrames={90}><Stage><T>Map: India → New Zealand</T><div style={{position: 'absolute', top: 300}}><RouteMap from="IND" fromLabel="India" to={[{iso: 'NZL', label: 'New Zealand', t: 1.2}]} t={0.1} height={1200} /></div></Stage></Sequence>
    <Sequence from={300} durationInFrames={90}><Stage><T>Bars + counter</T><div style={{position: 'absolute', top: 260}}><Counter to={100000} suffix="+" t={0.1} /></div><div style={{position: 'absolute', top: 640}}><BarChart t={0.6} items={[{label: 'Wholesale India', value: 45, display: '₹45'}, {label: 'Retail UK', value: 1200, display: '₹1,200', highlight: true}]} /></div></Stage></Sequence>
    <Sequence from={390} durationInFrames={90}><Stage><T>Line chart</T><LineChart t={0.2} values={[12, 18, 15, 26, 31, 44]} labels={['2021', '22', '23', '24', '25', '26']} /></Stage></Sequence>
    <Sequence from={480} durationInFrames={90}><Stage><T>Phone mockup</T><div style={{position: 'absolute', top: 260}}><PhoneMockup t={0.1} m={{src: 'bandana1.jpg'}} /></div></Stage></Sequence>
    <Sequence from={570} durationInFrames={90}><Stage><T>Laptop mockup</T><LaptopMockup t={0.1} m={{src: 'indiamart.mp4', video: true}} /></Stage></Sequence>
    <Sequence from={660} durationInFrames={90}><Stage><T>Annotations</T><div style={{position: 'relative', width: 980}}><Img src={staticFile('news.png')} style={{width: 980, borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}} /><HighlightMark x={300} y={175} w={340} h={70} t={0.3} /><CircleMark x={600} y={160} w={130} h={80} t={0.8} /><UnderlineMark x={20} y={110} w={560} t={1.2} /><ArrowMark x1={900} y1={420} x2={720} y2={260} t={1.6} /></div></Stage></Sequence>
    <Sequence from={750} durationInFrames={90}><AbsoluteFill style={{background: CREAM}}><div style={{position: 'absolute', top: 500, left: 50}}><LaptopMockup t={0} m={{src: 'indiamart.mp4', video: true}} /></div></AbsoluteFill><PipBubble src="aroll.mp4" t={0.2} /></Sequence>
    <Sequence from={930} durationInFrames={90}><Stage><T>Before / after</T><div style={{position: 'absolute', top: 280}}><BeforeAfterWipe t={0.1} before={{src: 'before.jpg'}} after={{src: 'after.jpg'}} /></div></Stage></Sequence>
    <Sequence from={1020} durationInFrames={90}><Video src={staticFile('aroll.mp4')} muted style={{width: 1080, height: 1920}} /><FilmLook grain={0.12} vignette={0.45} warm={0.12} leak /><Sticker emoji="rocket" x={820} y={420} t={0.1} /><Sticker emoji="fire" x={250} y={620} t={0.4} size={180} rotate={10} /><Sticker emoji="hundred" x={800} y={1450} t={0.7} size={200} /><ArrowSticker x={300} y={1300} t={0.5} dir="down" /></Sequence>
  </AbsoluteFill>
);
