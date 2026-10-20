import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {CREAM, INK, SANS, SERIF, BLUE} from './theme';
import {Globe3D} from './Globe';
import {PaperBg, TornCutout, VoxLabel, Typewriter, VoxHeadline, MarkerLoop, PinBoard, VOX_RED} from './Vox';
import {FilmLook} from './Effects';

const Cream: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 25%, #FDFBF6 0%, ${CREAM} 55%, #E8E2D4 100%)`}}>{children}</AbsoluteFill>;
export const KitDemo = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={165}>
      <Cream>
        <div style={{position: 'absolute', top: 150, width: 1080, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: INK}}>Export routes from</div>
        <div style={{position: 'absolute', top: 235, width: 1080, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: BLUE}}>India</div>
        <div style={{position: 'absolute', top: 470, left: 40}}><Globe3D from="IND" fromLabel="India" t={0.1} size={1000} to={[{iso: 'ARE', label: 'UAE', t: 2.2}, {iso: 'GBR', label: 'UK', t: 2.6}, {iso: 'USA', label: 'USA', t: 3.0}, {iso: 'NZL', label: 'New Zealand', t: 3.4}]} /></div>
      </Cream>
    </Sequence>
    <Sequence from={165} durationInFrames={120}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #0B1630 0%, #03060F 75%)'}}>
        <div style={{position: 'absolute', top: 470, left: 40}}><Globe3D theme="night" from="IND" fromLabel="India" t={0.1} size={1000} spin={200} to={[{iso: 'NZL', label: 'New Zealand', t: 2.0}]} /></div>
        <div style={{position: 'absolute', top: 180, width: 1080, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: '#FFC928'}}>India → NZ FTA</div>
      </AbsoluteFill>
    </Sequence>
    <Sequence from={285} durationInFrames={165}>
      <PaperBg />
      <VoxHeadline pre="A ₹400 bowl that sells for" key_="₹9,000" post="abroad" y={110} t={0.1} size={92} />
      <TornCutout src="stall.jpg" x={50} y={470} w={520} h={680} t={0.6} rot={-4} from="left" seed="s1" position="50% 55%" />
      <TornCutout src="lux.jpg" x={500} y={600} w={530} h={700} t={1.1} rot={4} from="right" seed="s2" position="50% 65%" />
      <VoxLabel text="India · ₹400" x={80} y={1060} t={1.6} />
      <VoxLabel text="London · ₹9,000" x={560} y={1220} t={2.1} bg={VOX_RED} />
      <MarkerLoop x={520} y={1180} w={470} h={150} t={2.6} />
      <Typewriter text={'Saharanpur → London.\nSame bowl. 22x price.'} x={90} y={1420} t={3.0} size={44} />
      <FilmLook grain={0.08} t={0} />
    </Sequence>
    <Sequence from={450} durationInFrames={150}>
      <PaperBg seed={9} />
      <VoxHeadline pre="How the bowl" key_="travels" y={120} t={0.1} size={100} />
      <TornCutout src="product2.jpg" x={330} y={380} w={420} h={420} t={0.3} rot={-3} seed="p" />
      <PinBoard pins={[{x: 230, y: 950, label: 'Saharanpur', t: 0.8}, {x: 300, y: 1350, label: 'Mundra port', t: 1.3}, {x: 820, y: 1000, label: 'London', t: 1.9}, {x: 790, y: 1450, label: 'New York', t: 2.4}]} links={[[0, 1, 1.4], [1, 2, 2.0], [1, 3, 2.5]]} />
      <FilmLook grain={0.08} t={0} />
    </Sequence>
  </AbsoluteFill>
);
