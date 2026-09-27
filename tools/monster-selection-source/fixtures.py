"""Independent finite expectations, frozen before the original-source run."""
from itertools import product


def cases():
    rows = []
    # Decimal lexical order is deliberate: AIR sort has no NUMERIC flag.
    distances = [0, 1, 2, 9, 10, 20, 99, 100, 101, 400, 599, 600, 601, 999, 1000, 1001, 2000]
    for a, b, radius in product(distances, distances, [600, 1000]):
        chosen = 'p1' if str(a) <= str(b) else 'p2'
        distance = a if chosen == 'p1' else b
        rows.append(dict(id=f'axis/{a}/{b}/{radius}', p1=[a, 0], p2=[b, 0],
                         states=['live', 'live'], radius=radius,
                         expected=chosen if distance <= radius else None, sequence='choose'))
    # Integer hypotenuses avoid deriving expected from native Number strings.
    for a, b, target in [([60, 80], [20, 0], 'p1'), ([80, 60], [200, 0], 'p1'),
                         ([100, 400], [200, 0], 'p2'), ([-60, -80], [-20, 0], 'p1'),
                         ([3, 4], [-3, -4], 'p1'), ([0, 20], [0, 100], 'p2')]:
        rows.append(dict(id=f'2d/{len(rows)}', p1=a, p2=b, states=['live', 'live'],
                         radius=1000, expected=target, sequence='choose'))
    for a, b in product(['missing', 'live', 'dead', 'retired'], repeat=2):
        eligible = [slot for slot, state in zip(['p1', 'p2'], [a, b]) if state in ['live', 'retired']]
        target = 'p2' if 'p2' in eligible else 'p1' if 'p1' in eligible else None
        rows.append(dict(id=f'candidates/{a}/{b}', p1=[400, 0], p2=[100, 0],
                         states=[a, b], radius=1000, expected=target, sequence='choose'))
    for sequence, target in [('retain-live', 'old'), ('clear-dead', None), ('reselect-dead', 'p2'),
                             ('clear-retired', None), ('reselect-retired', 'p2'),
                             ('blocked', None), ('hurt', None)]:
        rows.append(dict(id=sequence, p1=[20, 0], p2=[100, 0], states=['live', 'live'],
                         radius=1000, expected=target, sequence=sequence))
    # Small decimal values exactly representable by Sprite twips; equal roots and boundary.
    for a, b, radius, expected in [(1.5, 1.25, 1000, 'p2'), (10.5, 2.5, 1000, 'p1'),
                                  (599.95, 600, 600, 'p1'), (600, 600, 600, 'p1'),
                                  (600.05, 600.1, 600, None)]:
        rows.append(dict(id=f'decimal/{a}/{b}', p1=[a, 0], p2=[b, 0], states=['live', 'live'],
                         radius=radius, expected=expected, sequence='choose'))
    return rows


def verify(report):
    expected = cases()
    actual = report['rows']
    assert len(actual) == len(expected)
    assert [r['id'] for r in actual] == [r['id'] for r in expected]
    for row, sample in zip(expected, actual):
        assert sample['target'] == row['expected'], (row['id'], sample['target'], row['expected'])
        # Config's original method includes retired-but-live heroes; does not include pets.
        candidates = [slot for slot, state in zip(['p1','p2'], row['states']) if state in ['live','retired']]
        assert sample['candidates'] == candidates, (row['id'], sample['candidates'], candidates)
    return len(expected)
