"""Finite state for audited script-free timelines; every projection requires native comparison."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

class NativePhaseModel:
    def __init__(self, source, cid):
        self.timelines = source['timelines']
        self.root = self.create(cid)

    def create(self, cid):
        node = dict(cid=cid, frame=1 if str(cid) in self.timelines else None, children={})
        self.construct(node)
        return node

    def construct(self, node):
        if node['frame'] is None:
            return
        placements = self.timelines[str(node['cid'])][node['frame']-1]
        children = {}
        for p in placements:
            identity = (p['depth'], p['characterId'], p['placedAt'])
            child = node['children'].get(identity)
            if child is None:
                child = self.create(p['characterId'])
            else:
                self.construct(child)
            children[identity] = child
        node['children'] = children

    def advance(self, node=None):
        node = self.root if node is None else node
        if node['frame'] is not None:
            old_frame = node['frame']
            previous = {p['depth']: p for p in self.timelines[str(node['cid'])][old_frame-1]}
            node['frame'] = node['frame'] % len(self.timelines[str(node['cid'])]) + 1
            children = {}
            for p in self.timelines[str(node['cid'])][node['frame']-1]:
                identity = (p['depth'], p['characterId'], p['placedAt'])
                child = node['children'].get(identity)
                leaf = str(p['characterId']) not in self.timelines
                old = previous.get(p['depth'])
                rewound_shape = leaf and node['frame'] == 1 and old_frame != 1 and old != p
                # Original AIR reconstructs changed shapes at rewind, exposing a
                # pending child before construction; forward shape replacement
                # reuses the existing display slot. Native phase gates cover both.
                if rewound_shape:
                    child = None
                if child is None:
                    if leaf and old is not None and str(old['characterId']) not in self.timelines and not rewound_shape:
                        child = self.create(p['characterId'])
                    else:
                        child = dict(cid=p['characterId'], pending=True)
                else:
                    self.advance(child)
                children[identity] = child
            node['children'] = children

    def phase(self, node=None):
        node = self.root if node is None else node
        if node.get('pending'):
            return dict(pendingConstruction=True)
        return dict(children=[self.phase(c) for c in node['children'].values()], frame=node['frame'])

    def state(self, node=None):
        node = self.root if node is None else node
        if node.get('pending'):
            return (node['cid'], 'pending')
        return (node['cid'], node['frame'], tuple((key, self.state(child)) for key, child in node['children'].items()))

    def next_enter(self):
        self.finish_pending(self.root)
        self.advance()

    def finish_pending(self, node):
        for key, child in node['children'].items():
            if child.get('pending'):
                node['children'][key] = self.create(child['cid'])
            else:
                self.finish_pending(child)

    def cycle(self, limit=20000):
        visited, phases = {}, []
        for age in range(1, limit+1):
            state = self.state()
            if state in visited:
                return dict(start=visited[state], period=age-visited[state], phases=phases)
            visited[state] = age
            phases.append(self.phase())
            self.next_enter()
        raise AssertionError('No finite closure within investigation bound')

if __name__ == '__main__':
    data = json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-229/geometry-inputs.json').read_text())
    oracle = json.loads((ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/natural-collision-air/measurement.json').read_text())
    observed = {(r['symbol'], r['tick']): json.loads(r['phaseKey'].split('|', 1)[1]) for r in oracle['cases']}
    for source in data['sources']:
        for symbol, cid in source['roots'].items():
            if not symbol.startswith('PetHorse') or symbol == 'PetHorseIceEffect':
                continue
            model = NativePhaseModel(source, cid)
            failures = []
            for tick in range(122):
                if tick > 1:
                    model.next_enter()
                expected = observed.get((symbol, tick))
                if expected != model.phase():
                    failures.append(dict(tick=tick, expected=expected, actual=model.phase()))
            cycle = NativePhaseModel(source, cid).cycle()
            print(symbol, 'cycle', cycle['start'], cycle['period'], 'mismatches', len(failures), json.dumps(failures[:1]))
