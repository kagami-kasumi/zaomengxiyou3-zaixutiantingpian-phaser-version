"""Run actual production branch mutants against the independent native callback/target traces."""
import hashlib
import json
from pathlib import Path
import subprocess
from mutation_io import write_source

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "src/systems/pet-behaviors/MonkeyPetBehavior.ts"
OUTPUT = ROOT / "docs/tasks/evidence/TASK-SLICE-226/aoyi-mutations.json"
CASES = [
    ("counter-cancels-chain", "if (!counter && this.form === 4", "if (this.form === 4", "pet-monkey-aoyi-body-tests"),
    ("omit-body-completion", "event.eventName === 'complete') {", "event.eventName === 'complete' && false) {", "pet-monkey-aoyi-body-tests"),
    ("continuous-side", "(left ? -50 : 50)", "(context.random() * 100 - 50)", "pet-monkey-aoyi-target-tests"),
    ("filter-dead", "target.colliderLeft > 20 && target.colliderLeft < 920", "target.isAlive && target.colliderLeft > 20 && target.colliderLeft < 920", "pet-monkey-aoyi-target-tests"),
    ("inclusive-edges", "target.colliderLeft > 20 && target.colliderLeft < 920", "target.colliderLeft >= 20 && target.colliderLeft <= 920", "pet-monkey-aoyi-target-tests"),
    ("emit-overwritten-xj", "if (!final && context.pet.skills.includes('xj')) context.playAnimation('monkey3-xj');", "if (!final && context.pet.skills.includes('xj')) context.castSkillAt(params => requestPetMonkey3XjSkill({ ...params, phase: 'emit' }), target);", "pet-monkey-aoyi-body-tests"),
    ("warp-success", "this.jgaoyiFinishing = false;\n          context.emit", "this.jgaoyiFinishing = false;\n          context.relocate(context.owner.x, context.owner.y - 50);\n          context.emit", "pet-monkey-aoyi-body-tests"),
    ("charge-chain-mp", "const final = this.jgaoyiRemaining === 1;", "context.spendMp(20);\n    const final = this.jgaoyiRemaining === 1;", "pet-monkey-aoyi-body-tests"),
]

def run(test):
    return subprocess.run(["node", "tools/run-system-tests.mjs", test], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")


original = SOURCE.read_bytes()
backup = ROOT / '.tmp/pet226-monkey-aoyi-original.ts'
backup.parent.mkdir(parents=True, exist_ok=True)
backup.write_bytes(original)
text = original.decode("utf-8")
results = []
try:
    for test in sorted(set(case[3] for case in CASES)):
        result = run(test)
        if result.returncode:
            raise RuntimeError(f"Baseline failed: {test}\n{result.stdout}\n{result.stderr}")
    for name, before, after, test in CASES:
        if text.count(before) != 1:
            raise RuntimeError(f"Mutation anchor is not unique: {name}")
        write_source(SOURCE, text.replace(before, after).encode("utf-8"))
        result = run(test)
        if result.returncode == 0 or "AssertionError" not in result.stderr:
            raise RuntimeError(f"Mutant not rejected by native assertion: {name}\n{result.stdout}\n{result.stderr}")
        results.append({"name": name, "test": test, "exitCode": result.returncode, "rejectedByNativeAssertion": True})
        write_source(SOURCE, original)
finally:
    write_source(SOURCE, original)
assert SOURCE.read_bytes() == original
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps({"sourceSha256": hashlib.sha256(original).hexdigest(), "sourceRestored": True,
    "mutations": results}, indent=2) + "\n", encoding="utf-8")
print(f"Monkey4 actual production mutants: {len(results)} rejected; original bytes restored.")
