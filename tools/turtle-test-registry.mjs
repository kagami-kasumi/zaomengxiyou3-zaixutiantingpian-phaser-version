const evidence = 'docs/tasks/evidence/';
const source = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/';
export const turtleTests = {
  'pet-turtle-lifecycle-tests': { inputs: [] },
  'pet-turtle-resource-tests': { inputs: ['TASK-SETTINGS-222A/body-native.json.gz'] },
  'pet-turtle-combat-clock-tests': { inputs: ['TASK-SETTINGS-222A/body-native.json.gz', 'TASK-SETTINGS-221/behavior-contract.json'], source: true },
  'pet-turtle-caller-order-tests': { inputs: ['TASK-SLICE-224A2/native-caller-order.json'], source: true },
  'pet-turtle-world-collision-tests': { inputs: ['TASK-SLICE-224A1/dynamic-call-oracle.jsonl'] },
  'pet-turtle-runtime-tests': { inputs: ['TASK-SETTINGS-221/source-trace.json', 'TASK-SLICE-224A2/native-caller-order.json'], source: true },
  'pet-turtle-link-tests': { inputs: ['TASK-SETTINGS-221/settlement-trace.json', 'TASK-SETTINGS-222A/buff-native.json.gz'], source: true },
  'pet-turtle-skill-runtime-tests': { inputs: ['TASK-SETTINGS-221/source-trace.json', 'TASK-SLICE-224B/native-caller-order.json'], source: true },
  'pet-turtle-oracle-tests': { inputs: ['TASK-SETTINGS-222A/body-native.json.gz', 'TASK-SETTINGS-222A/buff-native.json.gz'], nativeOracle: true },
  'pet-turtle-acceptance-tests': { inputs: ['TASK-SLICE-224A1/visual-oracle.json'], browser: true },
  'pet-turtle-combat-acceptance-tests': { inputs: ['TASK-SLICE-224A2/runtime-trace.json'], browser: true },
  'pet-turtle-link-acceptance-tests': { inputs: ['TASK-SLICE-224A3/link-trace.json'], browser: true },
  'pet-turtle-skill-acceptance-tests': { inputs: ['TASK-SLICE-224B/skill-runtime-trace.json'], browser: true },
  'pet-turtle-family-acceptance-tests': { inputs: [], browser: true },
};

export const defaultTurtleTests = ['pet-turtle-lifecycle-tests'];
export function turtleLocalInputs(names) {
  return [...new Set(names.flatMap(name => {
    const entry = turtleTests[name];
    if (!entry) return [];
    return [
      ...entry.inputs.map(p => evidence + p),
      ...(entry.source ? ['base/BasePet.as', 'export/pet/PetTurtle1.as', 'export/pet/PetTurtle2.as',
        'export/pet/PetTurtle3.as', 'export/pet/PetTurtle4.as'].map(p => source + p) : []),
      ...(entry.nativeOracle ? ['local-resources/regima/task-outputs/TASK-SETTINGS-222B'] : []),
      ...(entry.browser ? ['dist/index.html', evidence + 'TASK-SETTINGS-222A/body-native.json.gz'] : []),
    ];
  }))];
}
