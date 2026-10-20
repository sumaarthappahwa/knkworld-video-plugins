import json
C=json.load(open('/home/claude/moq/cues.json'))
PEAK={'w_soft':0.46,'w_deep':0.53,'w_short':0.21,'w_long':1.23,'r_bass':2.15,'r_metal':1.94,'t_scan':0.33,'t_scifi_click':0.13,'t_energy':0.14,'rm_mouse-click':0.12,'hit':0.03}
W=[(C['titleIn']+0.18,'w_soft',-11),(C['leadersIn']+0.08,'w_short',-12),(C['fta']+0.15,'w_short',-12),(C['fullIn'],'w_soft',-10),
   ((C['fullIn']+0.27+C['nz']+0.2)/2,'w_long',-12),(C['fullOut'],'w_deep',-11),(C['webIn'],'w_deep',-11),(C['webOut'],'w_soft',-12),
   (C['sitesIn'],'w_deep',-11),(C['sw2'],'w_soft',-12),(C['sw3'],'w_soft',-12),(C['sw4'],'w_soft',-12),(C['sw5'],'w_soft',-12),
   (C['checkIn'],'w_soft',-12),(C['ctaIn'],'w_soft',-10),(C['buyers'],'w_short',-12),(C['system'],'w_short',-12),(C['send']+0.35,'w_short',-11)]
T=[(0.3,'t_ui',-8),(1.55,'t_scifi_impact',-6.5),(2.55,'t_pop',-8),(C['leadersIn']+0.15,'t_energy',-8),(C['execute'],'t_scifi_impact',-6),
   (C['freeEntry'],'t_pop',-6.5),(C['nz'],'t_scifi_impact',-7),(C['ten'],'t_scifi_impact',-6.5),(C['register'],'t_scifi_click',-8),
   (C['retailer'],'t_ui',-7),(C['wholesaler'],'t_ui',-7),(C['distributor'],'t_ui',-7),(C['reach'],'t_pop',-7),
   (C['follow'],'t_ui',-6.5),(C['share'],'t_ui',-6.5),(C['supplier'],'t_pop',-7),(C['form'],'t_pop',-7),(C['partner'],'t_pop',-7),(C['registerThere'],'t_pop',-7),
   (C['moq'],'t_scifi_click',-6.5),(C['products'],'t_scifi_click',-6.5),(C['compliances'],'t_scifi_click',-6.5),(C['catalogue'],'t_scifi_click',-6.5),
   (C['withMoq'],'t_glass',-8),(C['send'],'t_ui',-6.5),(C['list'],'t_pop',-7),(C['comment']-0.2,'t_ui',-8),(C['typeEnd']+0.1,'t_ui',-8),(C['dm'],'t_success',-6)]
T+=[(C['hundred']+i*0.06,'rm_mouse-click',-14) for i in range(10)]
T+=[(C['ten']+0.25+i*0.12,'t_pop',-12) for i in range(5)]
n=18;T+=[(C['typeStart']+i*(C['typeEnd']-C['typeStart'])/n,'rm_mouse-click',-16) for i in range(n)]
R=[(C['leadersIn']+0.1,'r_bass',-7),(C['fullIn'],'r_metal',-6),(C['sitesIn'],'r_bass',-6),(C['ctaIn'],'r_metal',-6)]
H=[(C['leadersIn']+0.1,-9),(C['fullIn'],-8),(C['sitesIn'],-8),(C['ctaIn'],-8)]
def node(t,name,db,label):
    fr=max(0,round((t-PEAK.get(name,0))*30))
    return f'      <Audio name="{label} {name} @{t:.2f}s" src={{staticFile("sfx/{name}.wav")}} from={{{fr}}} volume={{{round(10**(db/20),4)}}} />'
out=['// Generated sound design: whooshes (movement), textures (events), risers & hits (builds). Peaks aligned to the action frame.',"import {Sequence, staticFile} from 'remotion';","import {Audio} from '@remotion/media';",'','export const Sfx = () => (','  <>']
for lab,items in (('WHOOSHES',W),('TEXTURES',T),('RISERS',R),('HITS',[(t,'hit',d) for t,d in H])):
    out.append(f'    <Sequence name="{lab}" layout="none">');out+=[node(t,n,d,lab.title()) for t,n,d in sorted(items)];out.append('    </Sequence>')
out+=['  </>',');','']
open('/home/claude/moq/proj/src/Sfx.tsx','w').write('\n'.join(out));print(len(W)+len(T)+len(R)+len(H),'sounds')
