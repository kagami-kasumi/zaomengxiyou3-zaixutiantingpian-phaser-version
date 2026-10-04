"""Compare native results to the independently authored property oracle."""
import json
import math
from capture import WORK, run
from fixtures import generate


def verify():
    actual = json.loads((WORK/'rows.json').read_text(encoding='utf-8'))
    cases = generate()
    assert len(actual) == len(cases)
    for case, row in zip(cases, actual):
        assert case['id'] == row['id']
        for key, value in case['expected'].items():
            observed = row[key]
            same = math.isclose(observed, value, abs_tol=1e-12) if isinstance(value, (int, float)) else observed == value
            assert same, (case, key, observed, value)
    print(f'PASS {len(cases)} native attribute cases')


if __name__ == '__main__':
    run()
    verify()
