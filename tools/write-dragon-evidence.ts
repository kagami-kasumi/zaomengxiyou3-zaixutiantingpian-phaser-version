import { writeFileSync as write } from 'node:fs';

/** Windows indexers can briefly deny opening an existing evidence file; never swallow a failed write. */
export function writeFileSync(...args: Parameters<typeof write>): void {
  // Negative test processes must never replace the production baseline before a later assertion fails.
  if (process.env.PET_DRAGON_MUTATION === '1') return;
  for (let attempt = 0; ; attempt++) {
    try { write(...args); return; }
    catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (attempt >= 5 || !['UNKNOWN', 'EBUSY', 'EACCES'].includes(code ?? '')) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}
