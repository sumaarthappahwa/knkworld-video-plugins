import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Reel} from './Reel';
import {TOTAL} from './cues';

Promise.all([
  loadFont({family: 'Inter', url: staticFile('fonts/inter-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: 'Inter', url: staticFile('fonts/inter-latin-600-normal.woff2'), weight: '600'}),
  loadFont({family: 'Inter', url: staticFile('fonts/inter-latin-700-normal.woff2'), weight: '700'}),
  loadFont({family: 'Inter', url: staticFile('fonts/inter-latin-800-normal.woff2'), weight: '800'}),
  loadFont({family: 'Instrument Serif', url: staticFile('fonts/instrument-serif-latin-400-italic.woff2'), style: 'italic'}),
]);

export const RemotionRoot = () => (
  <Composition id="IndiaNZFTA" component={Reel} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
);
