import { readFileSync } from 'node:fs';
export const mutations = {
 'local-rounding': [['PetPassiveImage.ts','camera.roundPixels = false;','camera.roundPixels = roundPixels;']],
 'roster-snapshot-mismatch': [['FormalPetMonkeyBodyBridge.ts', "if (member?.snapshot.petId && (pet?.id !== member.snapshot.petId\n          || pet.form !== member.snapshot.form || pet.species !== member.snapshot.species)) continue;", '/* mutant: accept stale generation */']],
 'wrong-parent': [['PetAttachedDisplayLifecycle.ts', 'entry.root.add(attachment.object);', '/* mutant: leave scene parent */']],
 'wrong-origin': [['PetPassiveAssets.ts', 'x: originX + pose.x', 'x: originX + pose.x + 4']],
 'wrong-direction': [['PetPassiveDisplayBridge.ts', 'sign: -host.direction, rootSign:', 'sign: host.direction, rootSign:']],
 'early-frame': [['PetPassiveDisplayBridge.ts', 'return Math.max(1, Math.floor(elapsed', 'return Math.max(1, 1 + Math.floor(elapsed']],
 'frozen-frame': [['PetPassiveDisplayBridge.ts', 'return Math.max(1, Math.floor(elapsed', 'return Math.max(1, Math.floor(0 * elapsed']],
 'refresh-replay': [['PetPassiveSession.ts', 'old.time = time; old.startTime = this.count;', 'old.time = time; old.startTime = this.count; old.isFirst = true;']],
 'numeric-expiry-clears': [
 ['HeroPetBuffSystem.ts', 'if (state.count - effect.startTime >= effect.time) state.effects[index] = null;', "if (state.count - effect.startTime >= effect.time) { state.effects[index] = null; visual?.({type:'hide',name:effect.name}); }"],
 ['PetPassiveDisplayBridge.ts', "if (signal.type !== 'show' || host.dead) return;", "if (signal.type === 'hide') { for(const c of this.heroes.get(key) ?? []) c.image.destroy(); this.heroes.delete(key); return; } if (host.dead) return;"]],
 'rest-clears-owner': [['HeroPartyPassiveDisplayBridge.ts', 'sync(snapshots: readonly PetCombatSnapshot[]) {', 'sync(snapshots: readonly PetCombatSnapshot[]) { if (snapshots.some(s => !s.petId) && display.snapshot().heroes.length) display.destroy();']],
 'exit-residual': [['PetPassiveDisplayBridge.ts', "for (const clip of this.pets.values()) clip.image.destroy();", 'for (const clip of this.pets.values()) clip.image.setName("passive:leaked");'],
 ['PetPassiveDisplayBridge.ts', 'for (const clips of this.heroes.values()) for (const clip of clips) clip.image.destroy();', '/* mutant: leak hero images on exit */']],
};
export function mutationPlugin(name) {
 const edits=mutations[name]; if(!edits)throw Error('Unknown mutation '+name);
 return {name:'passive-negative-'+name,setup(b){b.onLoad({filter:/\.ts$/},args=>{
 const applicable=edits.filter(([file])=>args.path.endsWith('/'+file)||args.path.endsWith('\\'+file));
 if(!applicable.length)return;
 let contents=readFileSync(args.path,'utf8').replaceAll('\r\n','\n');
 for(const [file,before,after] of applicable){if(!contents.includes(before))throw Error('Stale mutation '+name+'/'+file);contents=contents.replace(before,after);}
 return {loader:'ts',contents};
 });}};
}
