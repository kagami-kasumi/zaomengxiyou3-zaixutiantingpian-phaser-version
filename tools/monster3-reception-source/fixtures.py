"""Explicit finite direct receiver inputs, separate from expected outcomes."""
import json
from source import ROOT

def generate():
 side=json.loads((ROOT/'docs/reverse-engineering/reference/monster3-attack-collision-contract.json').read_text(encoding='utf-8'))
 names=[name for profile in side['profiles'] for name in profile['types']]
 scenarios=[('normal',{}),('geometry-miss',{'geometry':False}),('protected',{'protected':True}),
  ('dodge',{'miss':100,'petMiss':1,'roll':0.2}),('zero-roll',{'roll':0}),
  ('defense-before',{'defense':39}),('defense-equal',{'defense':40}),('defense-after',{'defense':41}),
  ('magic-quarter',{'magicDefense':25,'petMagicDefense':0.25}),('magic-full',{'magicDefense':100,'petMagicDefense':1}),
  ('magic-over',{'magicDefense':110,'petMagicDefense':1.1}),('magic-negative',{'magicDefense':-20,'petMagicDefense':-0.2}),
  ('critical',{'critical':100}),('flower',{'flower':True}),('fatal',{'hp':1}),
  ('phoenix-action',{'action':'hit2'}),('hero-action',{'action':'hit10_1'}),('difficulty1',{'difficulty':1}),('difficulty2-bingo',{'difficulty':2,'bingo':True}),
  ('shield-partial',{'shield':20}),('shield-full',{'shield':100}),('turtle-link',{'link':True}),
  ('miss-equal',{'miss':50,'petMiss':0.5,'roll':0.5}),('miss-below',{'miss':50,'petMiss':0.5,'roll':0.499999}),
  ('miss-above',{'miss':50,'petMiss':0.5,'roll':0.500001}),('source-hit',{'sourceHit':20,'miss':50,'petMiss':0.5,'roll':0.4}),
  ('mixed-critical',{'critical':50,'rolls':[0.9,0.1,0.8,0.7]}),('mixed-noncritical',{'critical':50,'rolls':[0.9,0.8,0.1,0.7]}),
  ('critical-equal',{'critical':50,'roll':0.5}),('critical-above',{'critical':50,'roll':0.500001}),
  ('reduce-magic',{'reduceMagic':0.2,'magicDefense':50,'petMagicDefense':0.5}),
  ('rabbit-before',{'rabbit':True,'rolls':[0.199999,0.9,0.9,0.9]}),('rabbit-equal',{'rabbit':True,'rolls':[0.2,0.9,0.9,0.9]}),
  ('role3-sd8',{'action':'hit12','sd':8}),('role3-sd9',{'action':'hit12','sd':9}),('gxp',{'gxp':True}),
  ('hmz-protected',{'protectionKind':'hmzFather'}),('lys-protected',{'protectionKind':'lysFather'}),
  ('umbrella2',{'shield':20,'shieldKind':'MAGIC_UMBRELLA_DEFEND2'}),('tjgl-partial',{'shield':20,'shieldKind':'tjgl_Shield'}),
  ('shield-equal',{'shield':40}),('shield-below',{'shield':39}),('shield-above',{'shield':41}),
  ('shield-sd',{'shield':20,'action':'hit12','sd':8}),('link-1',{'link':True,'defense':39}),
  ('link-19',{'link':True,'defense':21}),('link-20',{'link':True,'defense':20}),('link-21',{'link':True,'defense':19}),
  ('link-dead',{'link':True,'linkHp':0}),('link-one-sided',{'link':True,'linkBoth':False}),
  ('shield-link',{'shield':20,'link':True}),('qlfj-equal',{'qlfj':0.9}),('qlfj-below',{'qlfj':0.89999})]
 rows=[]
 for name in names:
  for owner in ['p1','p2']:
   for boss in [False,True]:
    for attack in [1,2]:
     for scenario,changes in scenarios:
      row=dict(id=f'{name}-{owner}-{int(boss)}-{attack}-{scenario}',name=name,owner=owner,boss=boss,
       shieldKind="MAGIC_UMBRELLA_DEFEND",linkHp=1000,linkBoth=True,qlfj=None,sourceHit=0,reduceMagic=0,rolls=None,rabbit=False,sd=0,gxp=False,protectionKind=None,difficulty=0,bingo=False,shield=0,link=False,attack=attack,scenario=scenario,hp=1000,geometry=True,protected=False,miss=0,petMiss=0,
       defense=0,magicDefense=0,petMagicDefense=0,critical=0,flower=False,roll=0.9,action='wait')
      row.update(changes);rows.append(row)
 assert len(names)==40 and len(rows)==16960
 return rows
