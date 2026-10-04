import body from '../assets/pet-reception-body.json';
import { PetAnimationClock, type PetAnimationDefinition } from './PetAnimationClock';

export type PetReceptionBodyForm = keyof typeof body.forms;
export type PetReceptionBodyAction = 'wait' | 'hit1' | 'hit2' | 'hurt' | 'dead';
export type PetReceptionBodyEntry = Readonly<{
  action: PetReceptionBodyAction;
  row: number;
  column: number;
}>;

/** Conditional hurt/dead row routing around the existing shared BBDC cursor.
 * HP, protection, movement, skills and display objects stay with their owners.
 * Non-reception actions are observed entry coordinates, not a new skill clock.
 */
export class PetReceptionBodyClock {
  private readonly source;
  private readonly clock: PetAnimationClock;
  private action: PetReceptionBodyAction;
  private stopped = false;
  private token = 0;

  constructor(form: PetReceptionBodyForm, entry?: PetReceptionBodyEntry,
    private readonly events: Readonly<{
      setStatic?(): void;
      destroy?(): void;
      cleanup?(kind: 'tiger-combo' | 'mouse-combo' | 'phoenix-aoyi'): void;
    }> = {}) {
    this.source = body.forms[form];
    this.action = entry?.action ?? 'wait';
    const row = entry?.row ?? this.source.waitRow;
    const definitions: Record<string, PetAnimationDefinition> = {};
    for (const action of ['wait', 'hit1', 'hit2', 'hurt', 'dead'] as const) {
      for (const [row, holds] of this.source.holds.entries()) {
        const count = this.source.counts[row]!;
        definitions[this.route(action, row)] = { row, holds,
          keyFrameCount: typeof count === 'number' ? count : undefined,
          keyFrameCountsByColumn: Array.isArray(count) ? count : undefined,
          loops: false, completionEvent: 'complete', resetKeyFrameOnComplete: true };
      }
    }
    this.clock = new PetAnimationClock(definitions, this.route(this.action, row));
    this.clock.setColumn(entry?.column ?? 0);
  }

  select(action: 'hurt' | 'dead'): boolean {
    if (action === 'hurt' && this.source.ignoreHurtDuringHit2 && this.action === 'hit2') return false;
    const target = this.source.actions[action];
    const current = this.clock.snapshot();
    const row = current.row !== target.row && (!target.requiresNonzeroColumn || current.column !== 0)
      ? target.row : current.row;
    if (target.resetTigerCombo) this.events.cleanup?.('tiger-combo');
    if (target.resetMouseCombo) this.events.cleanup?.('mouse-combo');
    if (target.endPhoenixAoyi) this.events.cleanup?.('phoenix-aoyi');
    this.action = action;
    if (action === 'dead') this.stopped = false;
    this.clock.select(this.route(action, row), ++this.token);
    return true;
  }

  repeatHurt(): void {
    if (this.action === 'hurt') this.clock.setColumn(0);
  }

  /** Reception requests the existing attack owner; no attack is executed here. */
  requestCounter(): void {
    this.action = 'hit1';
    this.clock.select(this.route('hit1', this.source.counterRow), ++this.token);
  }

  /** Observe the existing Phoenix transformation owner, without owning its duration. */
  synchronizeTransformation(active: boolean): void {
    if (!this.source.ignoreHurtDuringHit2 || this.action === 'hurt' || this.action === 'dead') return;
    if (active && this.action !== 'hit2') {
      const current = this.clock.snapshot(), targetRow = this.source.actions.hurt.row;
      const move = current.column !== 1 && current.row !== targetRow;
      this.action = 'hit2';
      this.clock.select(this.route('hit2', move ? targetRow : current.row), ++this.token);
      if (move) this.clock.setColumn(1);
    } else if (!active && this.action === 'hit2') {
      this.action = 'wait';
      this.clock.select(this.route('wait', this.source.waitRow), ++this.token);
    }
  }

  pause(): void { this.stopped = true; }
  resume(): void { this.stopped = false; }

  step(hostFps: number): void {
    if (this.stopped || (this.action !== 'hurt' && this.action !== 'dead')) return;
    this.clock.advance(1000 / hostFps, hostFps, event => {
      if (event.eventName !== 'complete') return;
      if (this.action === 'hurt') {
        this.events.setStatic?.();
        this.action = 'wait';
        this.clock.select(this.route('wait', this.source.waitRow), ++this.token);
      } else this.events.destroy?.();
    });
  }

  snapshot() {
    const cursor = this.clock.snapshot();
    return Object.freeze({ action: this.action, row: cursor.row, column: cursor.column,
      keyFrameIndex: cursor.keyFrameIndex, remainingHoldCount: cursor.remainingHoldCount,
      complete: cursor.complete, paused: this.stopped });
  }

  private route(action: PetReceptionBodyAction, row: number): string { return `${action}:${row}`; }
}
