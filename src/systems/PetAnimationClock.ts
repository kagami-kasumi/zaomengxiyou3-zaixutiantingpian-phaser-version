import type { PetCombatAnimationEventName } from './PetBehavior';

export type PetAnimationDefinition = Readonly<{
  row: number;
  holds: readonly number[];
  /** BBDC counts logical keyframes independently of the repeated atlas columns. */
  keyFrameCount?: number;
  loops: boolean;
  completionAction?: string;
  completionEvent?: PetCombatAnimationEventName;
  completionStatic?: boolean;
  hit?: Readonly<{ column: number; remaining: number }>;
  hits?: readonly Readonly<{ column: number; remaining: number }>[];
  enterEvent?: boolean;
}>;

export type PetAnimationClockEvent = Readonly<{
  action: string;
  actionToken: number;
  eventName: PetCombatAnimationEventName;
  elapsedHostTick: number;
  setStatic?: boolean;
}>;

/** Shared countdown cursor. Definitions own artwork facts; this clock owns no AI or damage. */
export class PetAnimationClock {
  private action: string;
  private token = 0;
  private column = 0;
  private keyFrameIndex = 0;
  private remaining: number;
  private elapsed = 0;
  private fractionalTicks = 0;
  private completed = false;

  constructor(private readonly definitions: Readonly<Record<string, PetAnimationDefinition>>, initial: string) {
    for (const definition of Object.values(definitions)) {
      if (!definition.holds.length || definition.holds.some((hold) => !Number.isSafeInteger(hold) || hold <= 0)) {
        throw new Error('Pet animation requires positive integer cell holds.');
      }
      if (definition.keyFrameCount !== undefined
        && (!Number.isSafeInteger(definition.keyFrameCount) || definition.keyFrameCount <= 0)) {
        throw new Error('Pet animation requires a positive logical keyframe count.');
      }
      if (definition.completionAction && !definitions[definition.completionAction]) {
        throw new Error('Pet animation completion route is missing.');
      }
    }
    this.action = initial;
    this.remaining = this.definition(initial).holds[0]!;
  }

  select(action: string, actionToken: number): void {
    if (!Number.isSafeInteger(actionToken) || actionToken < 0) throw new Error('Invalid pet action token.');
    const next = this.definition(action);
    if (this.action !== action) this.keyFrameIndex = 0;
    if (this.definition(this.action).row !== next.row) {
      this.column = 0;
      this.remaining = next.holds[0]!;
      this.elapsed = 0;
    }
    this.action = action;
    this.token = actionToken;
    this.completed = false;
  }

  restartCell(): void {
    this.column = 0;
    this.keyFrameIndex = 0;
    this.remaining = this.definition(this.action).holds[0]!;
    this.elapsed = 0;
    this.completed = false;
  }

  advance(deltaMs: number, hostFps: number,
    onEvent?: (event: PetAnimationClockEvent) => void): readonly PetAnimationClockEvent[] {
    if (!Number.isFinite(deltaMs) || deltaMs < 0 || !Number.isFinite(hostFps) || hostFps <= 0) {
      throw new Error('Invalid pet animation host clock.');
    }
    this.fractionalTicks += deltaMs * hostFps / 1000;
    const count = Math.floor(this.fractionalTicks + 1e-9);
    this.fractionalTicks = Math.max(0, this.fractionalTicks - count);
    const events: PetAnimationClockEvent[] = [];
    for (let tick = 0; tick < count && !this.completed; tick++) {
      let definition = this.definition(this.action);
      let action = this.action, token = this.token;
      const event = (eventName: PetCombatAnimationEventName) => {
        const value = Object.freeze({ action: this.action, actionToken: this.token, eventName,
          elapsedHostTick: this.elapsed + 1, setStatic: eventName === 'complete' && definition.completionStatic });
        events.push(value);
        onEvent?.(value);
      };
      // BaseBitmapDataClip calls enter before decrement, advance, or completion.
      if (definition.enterEvent) event('enter');
      const switchedInEnter = this.action !== action || this.token !== token;
      if (!switchedInEnter && [...(definition.hits ?? []), ...(definition.hit ? [definition.hit] : [])]
        .some(hit => hit.column === this.column && hit.remaining === this.remaining)) event('hit');
      // Source continues its decrement on the new row when enter changes state.
      definition = this.definition(this.action);
      action = this.action; token = this.token;
      if (this.remaining > 1) {
        this.remaining--;
        this.elapsed++;
      } else if (this.keyFrameIndex + 1 < (definition.keyFrameCount ?? definition.holds.length)) {
        this.column = (this.column + 1) % definition.holds.length;
        this.keyFrameIndex++;
        this.remaining = definition.holds[this.column]!;
        this.elapsed++;
      } else if (definition.loops) {
        this.column = 0;
        this.keyFrameIndex = 0;
        this.remaining = definition.holds[0]!;
        this.elapsed = 0;
      } else {
        if (definition.completionEvent) event(definition.completionEvent);
        // A behavior may select a source-defined conditional route in its callback.
        if (this.action !== action || this.token !== token) continue;
        if (definition.completionAction) this.select(definition.completionAction, this.token);
        else {
          this.elapsed++;
          this.completed = true;
        }
      }
    }
    return Object.freeze(events);
  }

  snapshot() {
    return Object.freeze({ action: this.action, actionToken: this.token, row: this.definition(this.action).row,
      column: this.column, keyFrameIndex: this.keyFrameIndex,
      remainingHoldCount: this.remaining, elapsedTicks: this.elapsed, complete: this.completed });
  }

  private definition(action: string): PetAnimationDefinition {
    const definition = this.definitions[action];
    if (!definition) throw new Error(`Unknown pet animation action: ${action}`);
    return definition;
  }
}
