"""Atomically replace watched source files without truncating them on open failure."""
import os
from pathlib import Path
import tempfile
import time

def write_source(path: Path, payload: bytes):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.pet-mutation-', suffix='.tmp', delete=False) as handle:
        candidate = Path(handle.name)
        handle.write(payload)
    try:
        for attempt in range(8):
            try:
                os.replace(candidate, path)
                return
            except OSError:
                if attempt == 7:
                    raise
                time.sleep(0.05 * (attempt + 1))
    finally:
        candidate.unlink(missing_ok=True)
