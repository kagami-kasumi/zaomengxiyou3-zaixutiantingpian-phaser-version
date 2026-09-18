"""Reproduce the resource package and all independent finite acceptance checks."""
import subprocess
import sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
for script,args in [('build.py',['--check']),('verify_metadata.py',[]),
                    *[('verify_visual.py',[mode]) for mode in ('body','effects','dynamic','buff')],
                    ('verify_collision.py',[]),('accept.py',[])]:
    subprocess.run([sys.executable,str(HERE/script),*args],check=True)
