"""Compatibility entry for the original monkey projection command."""
from pathlib import Path
import runpy
import sys
sys.argv.insert(1, 'monkey')
runpy.run_path(str(Path(__file__).with_name('generate_skill_effects.py')), run_name='__main__')
