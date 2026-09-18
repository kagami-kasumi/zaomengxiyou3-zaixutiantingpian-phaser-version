/** Read-only records decoded from the versioned 223 delivery, never gameplay state. */
export type TurtlePoint = Readonly<{ x: number; y: number }>;
export type TurtlePixels = Readonly<{ width: number; height: number; rgba: Uint8Array }>;
export type TurtleTree = Readonly<{
  path: string; matrix: { a: number; b: number; c: number; d: number; tx: number; ty: number };
  children: readonly TurtleTree[];
}>;
export type TurtlePart = Readonly<{
  image: string; origin: TurtlePoint; width: number; height: number;
  empty: boolean; sourcePath: string;
}>;
export type TurtleGroup = Readonly<{
  ownerPath: string; depth: number; paintParts: readonly TurtlePart[]; components: readonly TurtlePart[];
}>;
export type TurtleVisualState = Readonly<{
  id: string; nativeId: string; groups: readonly TurtleGroup[];
  meta: Readonly<{ form?: number; row?: number; column?: number; direct?: number;
    owner?: string; symbol?: string; tick?: number; scale?: number; sign?: number; tree?: TurtleTree }>;
  timing: Readonly<{ fixtureId: string; hostTick: number | null; action: string | null;
    row: number | null; column: number | null; count: number | null; direct: number | null;
    events: readonly (readonly unknown[])[]; phase: string | null }>;
  sourceTrace: Readonly<{ root?: TurtlePoint; tree?: TurtleTree; display?: TurtleTree;
    owner?: string; symbol?: string; tick?: number; action?: string; form?: number;
    column?: number; row?: number; count?: number; direct?: number; hp?: number; heroHp?: number;
    events?: readonly (readonly unknown[])[]; bullets?: readonly Readonly<Record<string, unknown>>[] }>;
  projectionLinks: readonly Readonly<{ objectId: string; ownerPath: string; sourcePath: string }>[];
}>;
export type TurtleVisualPackage = Readonly<{
  mode: string; states: readonly TurtleVisualState[]; clocks: unknown;
}>;
export type TurtleCollisionField = Readonly<{
  id: string; layout: 'plane' | 'tiles128'; width?: number; height?: number;
  originX?: number; originY?: number;
}>;
export type TurtleCollisionPackage = Readonly<{
  planes: Readonly<Record<string, Readonly<{ width: number; height: number; bits: string }>>>;
  mapping: Readonly<Record<string, string>>;
  fields: readonly TurtleCollisionField[];
  profiles: readonly Readonly<{ symbol: string; sampleTicks: readonly number[]; scales: readonly number[];
    sourceOwner: string; characterId: number; fixture: Readonly<{
    phaseMap: Readonly<Record<string, Readonly<Record<string, number>>>>; lastTick: number; [key: string]: unknown;
  }> }>[];
  trees: unknown; sampling: unknown; petColipse: unknown; monsterTargets: unknown; approvedResidual: unknown;
}>;
export type TurtleCollisionSample = Readonly<{
  field: string; sourceRoot: TurtlePoint;
  intersection: Readonly<{ x: number; y: number; width: number; height: number }>;
  targetDraw?: TurtlePoint; targetIndex?: number;
}>;
