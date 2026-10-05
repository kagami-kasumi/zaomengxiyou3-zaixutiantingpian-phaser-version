"""Run TASK-SETTINGS-261 source mutations serially and record oracle results."""
import hashlib
import importlib.util
import json
import subprocess
import sys
sys.dont_write_bytecode = True
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-261'
MUTATIONS = (
    'speed-unit',
    'gravity-first',
    'round-instead-twip',
    'root-offset',
    'wall-snap',
    'screen-clamp',
    'world-before-tween',
)


def load_verify():
    path = HERE / 'verify.py'
    spec = importlib.util.spec_from_file_location('task261_verify', path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f'Cannot load verifier: {path}')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    verifier = load_verify()
    results = []
    for mutation in MUTATIONS:
        report_path = OUT / f'capture-{mutation}.json'
        command = [sys.executable, str(HERE / 'capture.py'), mutation, '--controlled']
        completed = subprocess.run(
            command,
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=900,
        )
        result = {
            'mutation': mutation,
            'command': command,
            'captureExitCode': completed.returncode,
            'captureStdout': completed.stdout[-4000:],
            'captureStderr': completed.stderr[-4000:],
            'captureReport': str(report_path),
            'captureReportSha256': sha256(report_path) if report_path.exists() else None,
        }
        if completed.returncode != 0 or not report_path.exists():
            result['status'] = 'capture-failed'
            result['failureMessage'] = (completed.stderr or completed.stdout)[-4000:]
            results.append(result)
            continue
        report = json.loads(report_path.read_text(encoding='utf-8'))
        try:
            verification = verifier.verify(report, False)
        except AssertionError as error:
            result['status'] = 'killed'
            result['failureMessage'] = str(error)
            result['oracleRejectedIndependently'] = True
        except Exception as error:  # A verifier/runtime failure is not a kill.
            result['status'] = 'verify-failed'
            result['failureMessage'] = f'{type(error).__name__}: {error}'
            result['oracleRejectedIndependently'] = False
        else:
            result['status'] = 'survived'
            result['failureMessage'] = None
            result['oracleRejectedIndependently'] = False
            result['verification'] = verification
        results.append(result)
    payload = {
        'task': 'TASK-SETTINGS-261',
        'mode': 'controlled',
        'mutations': results,
    }
    target = OUT / 'source-mutations.json'
    target.write_text(json.dumps(payload, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'task': payload['task'],
        'statuses': {item['mutation']: item['status'] for item in results},
        'output': str(target),
    }))
    if any(item['status'] != 'killed' for item in results):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
