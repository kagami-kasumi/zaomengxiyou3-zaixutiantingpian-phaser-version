"""Reuse the independent native 231 oracle without changing its expected cases."""
import importlib.util
import json
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('native_expected', root/'tools/monster-reward-source/verify.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
path = Path(sys.argv[1]) if len(sys.argv) > 1 else root/'docs/tasks/evidence/TASK-SLICE-238/production-trace.json'
module.check(json.loads(path.read_text(encoding='utf-8')))
print('Independent native expected: 264/264 production states pass')
