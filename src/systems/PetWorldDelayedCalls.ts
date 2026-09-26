/** One scene-owned callback queue using the game's existing absolute timestamp. No private clock. */
export class PetWorldDelayedCalls {
  private pending: { due: number; serial: number; callback: () => void }[] = [];
  private serial = 0;
  private disposed = false;

  constructor(private readonly now: () => number) {}

  schedule(milliseconds: number, callback: () => void): void {
    if (this.disposed) throw new Error('Pet world timer is disposed');
    if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new Error('Invalid world delay');
    this.pending.push({ due: this.now() + milliseconds, serial: this.serial++, callback });
    this.pending.sort((a, b) => a.due - b.due || a.serial - b.serial);
  }

  advance(now: number): void {
    if (this.disposed) return;
    // Detach before invoking; source disposal and callbacks scheduling callbacks are safe.
    const due = this.pending.filter(job => job.due <= now);
    this.pending = this.pending.filter(job => job.due > now);
    for (const job of due) {
      if (this.disposed) break;
      job.callback();
    }
  }

  destroy(): void { this.disposed = true; this.pending = []; }
}
