"""Independent source-derived inputs/oracle, frozen before native case execution."""
import math


def generate():
    rows = []
    def add(owner, op, expected, **inputs):
        rows.append(dict(id=len(rows), owner=owner, op=op, expected=expected, **inputs))
    for owner in [1, 2]:
        for level in [1, 15, 16, 30, 31, 59, 60, 61, 89, 90]:
            add(owner, 'capture', dict(miss=0, mdef=0, level=level), level=level)
        for family in ['monkey', 'horse', 'ufo', 'tigress', 'turtle', 'phoenix', 'dragon', 'rabbit', 'roomhorse', 'mouse', 'neat', 'nian', 'terribletiger']:
            for level in [1, 59, 60, 90]:
                add(owner, 'capture', dict(miss=0, mdef=0, level=level), level=level, name=family+'3')
        for level in [1, 58, 59, 60, 61, 89, 90]:
            for roll in [0, 0.499999, 0.5, 0.999999]:
                for miss, mdef in [(0, 0), (0.23, 0.17), (0.48, 0.36), (0.8, 0.7)]:
                    grow = level >= 60
                    add(owner, 'recalc', dict(miss=miss+(0.01*math.floor(roll*2) if grow else 0), mdef=mdef+(0.01 if grow else 0), calls=[roll]*3 if grow else [], level=level), level=level, roll=roll, miss=miss, mdef=mdef)
        for level in [15, 29, 30, 58, 59, 60, 89, 90]:
            for roll in [0, 0.999999]:
                new = min(level+1, 90)
                grow = level < 90 and new >= 60
                add(owner, 'upgrade', dict(miss=0.23+(0.01*math.floor(roll*2) if grow else 0), mdef=0.17+(0.01 if grow else 0), calls=[roll]*3 if grow else [], level=new), level=level, roll=roll, miss=0.23, mdef=0.17)
        for miss, mdef in [(0, 0), (0.23, 0.17), (0.48, 0.36), (0.480001, 0.360001), (0.8, 0.7), (-0.1, -0.2)]:
            add(owner, 'save', dict(miss=min(miss, 0.48), mdef=min(mdef, 0.36), savedMiss=miss, savedMdef=mdef), miss=miss, mdef=mdef)
            add(owner, 'child', dict(miss=miss, mdef=mdef, level=1), miss=miss, mdef=mdef)
        add(owner, 'blank', dict(miss=0, mdef=0))
        add(owner, 'truncated', dict(miss='NaN', mdef='NaN', error=1009))
        add(owner, 'non-numeric', dict(miss='NaN', mdef='NaN', error=0))
        add(owner, 'reinitialize', dict(miss=0.23, mdef=0.17, level=60), miss=0.23, mdef=0.17)
        add(owner, 'child-grow', dict(miss=0.24, mdef=0.18, level=60), miss=0.23, mdef=0.17, roll=0.999999)
        for rolls in [[0, 0.9, 0.9], [0.9, 0, 0], [0.9, 0.9, 0.49]]:
            add(owner, 'recalc', dict(miss=0.01*math.floor(rolls[0]*2), mdef=0.01, crit=0.01+0.01*math.floor(rolls[2]*2), calls=rolls, level=60), level=60, miss=0, mdef=0, rolls=rolls)
        for roll in [0, 0.999999]:
            add(owner, 'continuous', dict(miss=0.31*math.floor(roll*2), mdef=0.31, level=90, calls=[roll]*93), level=59, miss=0, mdef=0, roll=roll)
    return rows
