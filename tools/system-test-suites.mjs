import { defaultTurtleTests } from './turtle-test-registry.mjs';

// Complete pre-existing regression remains available explicitly.
export const fullSystemTests = [
  'system-tests',
  'game-startup-frame-rate-tests',
  'level-lifecycle-tests',
  'level-result-tests',
  'crafting-tests',
  'stage11-resource-tests',
  'stage11-flow-tests',
  'stage12-resource-tests',
  'stage12-monster-visual-tests',
  'stage12-flow-tests',
  'stage12-traversal-tests',
  'stage12-fb-enter-tests',
  'stage13-resource-tests',
  'stage13-monster-visual-tests',
  'five-stage-monster-visual-regression-tests',
  'stage13-flow-tests',
  'stage13-traversal-tests',
  'stage21-tests',
  'stage22-tests',
  'stage1-combat-tests',
  'monster-knockback-tests',
  'monster-knockback-binding-tests',
  'combat-feedback-tests',
  'incoming-feedback-display-tests',
  'incoming-settlement-tests',
  'incoming-environment-tests',
  'incoming-feedback-runtime-tests',
  'remote-normal-attack-tests',
  'stage1-hud-tests',
  'role1-combat-visual-tests',
  'role2-combat-visual-tests',
  'hero-combat-visual-coordinate-tests',
  'stage-feature-entry-tests',
  'save-slot-tests',
  'pet-visual-qa-save-tests',
  'heaven-map-tests',
  'immortality-tests',
  'formal-shop-tests',
  'formal-settings-tests',
  'formal-task-tests',
  'feature-ui-host-tests',
  'dual-player-feature-save-tests',
  'party-save-tests',
  'save-schema-tests',
  'save-workshop-tests',
  'player-soul-system-tests',
  'save-party-flow-tests',
  'formal-inventory-tests',
  'equipment-tooltip-runtime-tests',
  'equipment-catalog-tests',
  'equipment-preview-catalog-tests',
  'equipment-workshop-transaction-closure-tests',
  'inventory-dynamic-ui-resource-tests',
  'formal-skill-tests',
  'formal-pet-tests',
  'formal-pet-journey-tests',
  'pet-monkey-family-runtime-tests',
  'pet-normal-attack-decision-tests',
  'pet-movement-clock-tests',
  'pet-dragon1-clock-tests',
  'pet-dragon1-presentation-tests',
  'pet-dragon1-consumer-tests',
  'pet-dragon23-collision-tests',
  'pet-dragon23-runtime-tests',
  'pet-dragon23-consumer-tests',
  'pet-dragon23-presentation-tests',
  'pet-dragon4-collision-tests',
  'pet-dragon4-runtime-tests',
  'pet-dragon4-presentation-tests',
  'pet-dragon-family-behavior-tests',
  'pet-dragon-family-consumer-tests',
  'pet-dragon-family-audit-tests',
  'pet-animation-session-tests',
  // Other turtle tests require native evidence/browser prerequisites;
  // see turtle-test-registry.mjs and local-validation.md. P1T runs them.
  ...defaultTurtleTests,
  'formal-workshop-host-tests',
  'formal-workshop-inventory-grid-tests',
  'formal-workshop-native-left-page-tests',
  'formal-strengthening-tests',
  'formal-resolution-tests',
  'formal-making-tests',
  'formal-magic-weapon-tests',
  'formal-game-loop-journey-tests',
  'pre-stage23-save-journey-tests',
  'formal-party-runtime-tests',
  'hero-party-runtime-tests',
  'hero-progression-runtime-tests',
  'monster-runtime-tests',
  'asset-bundle-tests',
  'stage-asset-ownership-tests',
  'monster-asset-ownership-tests',
];

// Daily invariants: startup cadence, save integrity, combat/ownership, level
// closure and shared pet lifecycle. Asset catalogs and exhaustive family
// matrices stay in fullSystemTests or are selected for an affected change.
export const coreSystemTests = [
  // The older broad suite still contains unique basic combat/progression cases.
  'system-tests',
  'game-startup-frame-rate-tests',
  'save-schema-tests',
  'save-slot-tests',
  'dual-player-feature-save-tests',
  'level-lifecycle-tests',
  'stage1-combat-tests',
  'incoming-settlement-tests',
  'incoming-environment-tests',
  'hero-party-runtime-tests',
  'monster-runtime-tests',
  'pet-animation-session-tests',
  ...defaultTurtleTests,
  'formal-game-loop-journey-tests',
];

export function selectSystemTests(args = []) {
  const flags = args.filter(arg => arg.startsWith('--'));
  for (const flag of flags) if (!['--core', '--full', '--list'].includes(flag)) throw new Error(`Unknown test option: ${flag}`);
  if (flags.includes('--core') && flags.includes('--full')) throw new Error('Choose --core or --full, not both');
  const names = args.filter(arg => !arg.startsWith('--'));
  for (const name of names) if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid test name: ${name}`);
  const scope = flags.includes('--full') ? 'full' : flags.includes('--core') || names.length === 0 ? 'core' : 'selected';
  const base = scope === 'full' ? fullSystemTests : scope === 'core' ? coreSystemTests : [];
  return { scope, tests: [...new Set([...base, ...names])], listOnly: flags.includes('--list') };
}
