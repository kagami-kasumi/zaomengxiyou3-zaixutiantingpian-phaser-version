import projection from './IncomingDamageFeedbackProjection.json';

export const IncomingDamageFeedbackTruthId = 'task-settings-215.player-pet-incoming-damage-feedback';

if (projection.truthId !== IncomingDamageFeedbackTruthId || projection.status !== 'verified'
  || !projection.completeness.displayListMatched || !projection.completeness.stateSetMatched
  || projection.completeness.unresolved.length !== 0 || projection.completeness.stateCount !== 109
  || projection.glyphs.length !== 10 || projection.animation.ease !== 'Quad.easeOut'
  || projection.rootSymbol !== 'my.ANumber') {
  throw new Error('Incoming damage feedback requires complete verified 215 truth');
}
projection.glyphs.forEach((glyph, digit) => {
  if (glyph.digit !== digit || glyph.symbolClass !== `pnum${digit}`) {
    throw new Error('Incoming damage feedback glyph identity mismatch');
  }
});

export const incomingDamageFeedbackAssets = projection.glyphs;
export const incomingDamageFeedbackProjection = projection;
