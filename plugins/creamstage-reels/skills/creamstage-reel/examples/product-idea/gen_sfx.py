import json
C=json.load(open('/home/claude/prod/cues.json'))
PEAK={'w_soft':0.46,'w_deep':0.53,'w_short':0.21,'w_long':1.23,'r_bass':2.15,'r_metal':1.94,'t_scan':0.33,'t_scifi_click':0.13,'t_energy':0.14,'rm_mouse-click':0.12,'hit':0.03}
W=[(C['titleIn']+0.18,'w_soft',-11),(C['productIn']+0.08,'w_short',-12),(C['demandIn'],'w_soft',-10),(C['uk']+0.2,'w_long',-12),
   (C['retailIn'],'w_deep',-11),(C['compareIn'],'w_soft',-12),(C['sourceIn'],'w_soft',-12),(C['imIn']+0.05,'w_deep',-11),(C['checkIn'],'w_soft',-12),
   (C['checkOut'],'w_deep',-11),(C['ctaIn'],'w_soft',-10),(C['interesting'],'w_short',-12),(C['follow'],'w_short',-12),(C['wholesale']+0.3,'w_long',-13)]
T=[(0.3,'t_ui',-8),(1.6,'t_scifi_impact',-6.5),(2.4,'t_pop',-8),(C['block']-0.2,'t_energy',-8),(C['block']+0.25,'t_pop',-8),(C['scarf'],'t_ui',-7),
   (C['uk']+0.3,'t_pop',-7),(C['europe']+0.3,'t_pop',-7),(C['p900'],'t_ui',-6.5),(C['p1000'],'t_ui',-6.5),(C['p1200'],'t_ui',-6.5),
   (C['p40'],'t_scifi_click',-6.5),(C['p45'],'t_scifi_click',-7),(C['wholesale']+0.5,'t_scifi_impact',-6),(C['jaipur'],'t_pop',-6.5),(C['gujarat'],'t_pop',-6.5),
   (C['hub'],'t_ui',-7),(C['suppliers'],'t_ui',-6.5),(C['low'],'t_scifi_click',-6.5),(C['high'],'t_scifi_click',-6.5),(C['b2b'],'t_scifi_click',-6.5),
   (C['interesting'],'t_ui',-7),(C['follow'],'t_ui',-6.5),(C['difficulty'],'t_scifi_impact',-6.5),(C['comment']-0.2,'t_ui',-8),(C['typeEnd']+0.1,'t_ui',-8),(C['followBtn'],'t_success',-6)]
n=16;T+=[(C['typeStart']+i*(C['typeEnd']-C['typeStart'])/n,'rm_mouse-click',-16) for i in range(n)]
R=[(C['productIn']+0.1,'r_bass',-7),(C['demandIn'],'r_metal',-6),(C['compareIn'],'r_bass',-6),(C['ctaIn'],'r_metal',-6)]
H=[(C['productIn']+0.1,-9),(C['demandIn'],-8),(C['compareIn'],-8),(C['ctaIn'],-8)]
def node(t,name,db,label):
    fr=max(0,round((t-PEAK.get(name,0))*30))
    return f'      <Audio name="{label} {name} @{t:.2f}s" src={{staticFile("sfx/{name}.wav")}} from={{{fr}}} volume={{{round(10**(db/20),4)}}} />'
out=["import {Sequence, staticFile} from 'remotion';","import {Audio} from '@remotion/media';",'','export const Sfx = () => (','  <>']
for lab,items in (('WHOOSHES',W),('TEXTURES',T),('RISERS',R),('HITS',[(t,'hit',d) for t,d in H])):
    out.append(f'    <Sequence name="{lab}" layout="none">');out+=[node(t,n,d,lab.title()) for t,n,d in sorted(items)];out.append('    </Sequence>')
out+=['  </>',');','']
open('/home/claude/prod/proj/src/Sfx.tsx','w').write('\n'.join(out));print(len(W)+len(T)+len(R)+len(H),'sounds')
