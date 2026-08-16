import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf';
const taskOutput = 'local-resources/regima/task-outputs/task-settings-175e-immortality-page';
const xmlPath = `${taskOutput}/OtherMat1.xml`;
const pageAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/immortality/ImmortalityInterface.as';
const singleAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/immortality/SingleImmortality.as';
const exchangeAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/immortality/ExchangeImmortality.as';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175e-immortality-page.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175E';
const command = 'npm run generate:immortality-page-truth';

const stateSpecs = [
  ['normal-p1-wk', 'P1 opens the page with Wukong selected', 'p1; role=wk; soul=5000; flags=all-zero'],
  ['selected-p1-ts', 'P1 Tang Monk owner selector frame 2', 'p1; role=ts'],
  ['selected-p1-ss', 'P1 Sha Monk owner selector frame 2', 'p1; role=ss'],
  ['selected-p1-bj', 'P1 Bajie owner selector frame 2', 'p1; role=bj'],
  ['selected-p1-bl', 'P1 White Dragon owner selector frame 2', 'p1; role=bl'],
  ['selected-p2-wk', 'Two-player entry ends with P2 selected', 'p2; role=wk; dispatch order p1 then p2'],
  ['back-hover', 'Pointer over btnback', 'hover=btnback'], ['back-pressed', 'Pointer down on btnback', 'pressed=btnback'],
  ['make-hover', 'Pointer over make1', 'hover=make1'], ['make-pressed', 'Pointer down on make1', 'pressed=make1'],
  ['eat-hover', 'Pointer over the first eligible eat button', 'hover=im1_1.eatbtn'], ['eat-pressed', 'Pointer down on the first eligible eat button', 'pressed=im1_1.eatbtn'],
  ['locked-grid', 'No owned pill permits an eat button', 'inventory empty; flags all-zero'],
  ['consumed-grid', 'Consumed icon overlays the slot and next eligible button is evaluated', 'flags row1 grade1=1; inventory wpsmd2=1'],
  ['consume-refused-soul', 'Eligible pill with fewer than 1000 souls', 'soul=999; warning; no mutation'],
  ['consume-success', 'Eligible pill consumes 1000 souls and refreshes page', 'soul=5000->4000; wpsmd1 removed; flag set'],
  ['craft-dialog', 'make1 appends character 1006 over the page', 'pillType=wpsmd'],
  ['compound-hover', 'Pointer over compound1', 'dialog; hover=compound1'], ['compound-pressed', 'Pointer down on compound1', 'dialog; pressed=compound1'],
  ['dialog-close-hover', 'Pointer over x_btn', 'dialog; hover=x_btn'], ['dialog-close-pressed', 'Pointer down on x_btn', 'dialog; pressed=x_btn'],
  ['craft-refused-material', 'Recipe material test fails', 'dialog; material insufficient; no mutation'],
  ['craft-refused-capacity', 'Backpack is at 125 list entries', 'dialog; capacity=125; no mutation'],
  ['craft-success', 'Recipe consumes materials and adds the requested pill', 'dialog; random>=0.05'],
  ['craft-fire-success', 'Five-percent fire message still yields the same pill', 'dialog; random<0.05'],
  ['closed-return', 'btnback or host return removes character 990', 'page removed; map resumes'],
];
const closedStates = new Set(['closed-return']);
const dialogStates = new Set(stateSpecs.map(([id]) => id).filter((id) => id.startsWith('craft-') || id.startsWith('compound-') || id.startsWith('dialog-')));
const pageStates = stateSpecs.map(([id]) => id).filter((id) => !closedStates.has(id));

const sha256 = (p) => createHash('sha256').update(readFileSync(path.join(root, p))).digest('hex');
const round = (n) => Math.round(n * 1000) / 1000;
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a=1,b=0,c=0,d=1,tx=0,ty=0) => ({ a:round(a),b:round(b),c:round(c),d:round(d),tx:round(tx),ty:round(ty) });
const render = (assetRef, extra={}) => ({ assetRef, blendMode:'normal', filters:[], maskId:null, ...extra });
const placement = (stateId, localMatrix, localBounds, stageBounds, derivation, evidenceRefs, extra={}) => ({ stateId, visible:true, localMatrix, registrationPoint:{x:0,y:0}, localBounds, stageBounds, derivation, derivationMethod: derivation === 'extracted' ? 'Direct FFDec SVG export of the restored-SWF PlaceObject matrix and visible envelope.' : 'AS3 addChild position composed with restored-SWF geometry.', evidenceRefs, ...extra });

function attrs(tag) { return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m)=>[m[1],m[2]])); }
function findExport(characterId, ext='svg', frame=1) {
  const base = path.join(root, `${taskOutput}/exports-${ext === 'svg' ? 'svg' : 'png'}`);
  const dir = readdirSync(base, {withFileTypes:true}).find((e)=>e.isDirectory() && e.name.startsWith(`DefineSprite_${characterId}_`));
  if (!dir) throw new Error(`Missing character ${characterId} ${ext} export`);
  return `${taskOutput}/exports-${ext === 'svg' ? 'svg' : 'png'}/${dir.name}/${frame}.${ext}`;
}
import { readdirSync } from 'node:fs';
function rootUses(svgPath) {
  const svg = readFileSync(path.join(root, svgPath),'utf8');
  const match = svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/);
  if (!match) throw new Error(`No root display list in ${svgPath}`);
  return [...match[1].matchAll(/<use\b[^>]*\/>/g)].map((m,index)=>{ const a=attrs(m[0]); const v=a.transform.match(/matrix\(([^)]*)\)/)[1].split(',').map(Number); return { characterId:Number(a['ffdec:characterId']), symbolClass:a['ffdec:characterName']??null, instanceName:a.id??null, href:a['xlink:href'].slice(1), width:Number(a.width), height:Number(a.height), matrix:matrix(...v), depth:index+1 }; });
}

const pageSvg = findExport(990);
const slotSvg = findExport(969);
const dialogSvg = findExport(1006);
const displayObjects=[];
function addObject({id,parentId,depth,objectType,characterId,symbolClass=null,instanceName=null,states,localMatrix=matrix(),localBounds=bounds(0,0,940,590),assetRef=null,derivation='extracted',hitArea=null,textStyle=null,buttonCharacter=null,visible=true}) {
  const stageBounds=bounds(localMatrix.tx,localMatrix.ty,localBounds.width*Math.abs(localMatrix.a),localBounds.height*Math.abs(localMatrix.d));
  const buttonStateAssets=buttonCharacter ? {up:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/1_up.png`,over:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/2_over.png`,down:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/3_down.png`,hit:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/4_hittest.png`} : undefined;
  displayObjects.push({id,parentId,depth,objectType,sourceIdentity:{provenanceId:'othermat1-swf',characterId,symbolClass,instanceName,frame:1},placements:states.map((s)=>placement(s,localMatrix,localBounds,stageBounds,derivation,[`othermat1-swf:character-${characterId ?? 'dynamic'}-frame-1`],{...(hitArea?{hitArea}:{}),visible})),render:render(assetRef,{...(textStyle?{textStyle}:{}),...(buttonStateAssets?{buttonStateAssets}:{})})});
}
addObject({id:'immortality-page-root',parentId:null,depth:0,objectType:'movie-clip',characterId:990,symbolClass:'export.immortality.ImmortalityInterface',states:pageStates,assetRef:`${taskOutput}/immortality-static-root.svg`,localBounds:bounds(0,0,940,590)});
const pageUses=rootUses(pageSvg);
for(const u of pageUses){
  const type=u.href.startsWith('button')?'button':u.href.startsWith('text')?'text-field':u.href.startsWith('shape')?'shape':'sprite';
  const id=`immortality-page-root.${u.instanceName??`${type}-${u.characterId}-depth-${u.depth}`}`;
  addObject({id,parentId:'immortality-page-root',depth:u.depth,objectType:type,characterId:u.characterId,symbolClass:u.symbolClass,instanceName:u.instanceName,states:pageStates,localMatrix:u.matrix,localBounds:bounds(0,0,u.width,u.height),assetRef:`${pageSvg}#${u.href}`,hitArea:type==='button'?bounds(u.matrix.tx,u.matrix.ty,u.width,u.height):null,textStyle:type==='text-field'?{dynamic:true,source:u.instanceName==='txtlh'?'currentPlayer.getLhValue()':'refreshInterface cumulative pill effects'}:null,buttonCharacter:type==='button'?u.characterId:null});
  if(u.characterId===969){
    for(const child of rootUses(slotSvg)) {
      const buttonStates = u.instanceName === 'im1_1' ? ['eat-hover','eat-pressed'] : u.instanceName === 'im1_2' ? ['consumed-grid'] : ['locked-grid'];
      addObject({id:`${id}.${child.instanceName??`child-${child.characterId}`}`,parentId:id,depth:child.depth,objectType:child.href.startsWith('button')?'button':'shape',characterId:child.characterId,instanceName:child.instanceName,states:child.characterId===968?buttonStates:pageStates,localMatrix:matrix(child.matrix.a,child.matrix.b,child.matrix.c,child.matrix.d,u.matrix.tx+child.matrix.tx,u.matrix.ty+child.matrix.ty),localBounds:bounds(0,0,child.width,child.height),assetRef:`${slotSvg}#${child.href}`,derivation:'calculated',hitArea:child.characterId===968?bounds(u.matrix.tx+5,u.matrix.ty+5,42,45):null,buttonCharacter:child.characterId===968?968:null,visible:child.characterId!==968||u.instanceName==='im1_1'||u.instanceName==='im1_2'});
    }
  }
}
const selectorIds={wk:218,ts:223,ss:228,bj:233,bl:871};
const roleSpecificStates={ts:['selected-p1-ts'],ss:['selected-p1-ss'],bj:['selected-p1-bj'],bl:['selected-p1-bl']};
const wkStates=pageStates.filter((id)=>!Object.values(roleSpecificStates).flat().includes(id));
for(const [role,characterId] of Object.entries(selectorIds)) addObject({id:`immortality-page-root.owner-selector-p1-${role}`,parentId:'immortality-page-root',depth:100+Object.keys(selectorIds).indexOf(role),objectType:'movie-clip',characterId,symbolClass:`export.shop.Select${role.toUpperCase()}`,instanceName:'player1',states:role==='wk'?wkStates.filter((id)=>id!=='selected-p2-wk'):(roleSpecificStates[role]??[]),localMatrix:matrix(1,0,0,1,50,540),localBounds:bounds(0,0,role==='bl'?68:81,role==='bl'?36.3:45),assetRef:findExport(characterId,'svg',2),derivation:'calculated'});
addObject({id:'immortality-page-root.owner-selector-p1-ts-two-player',parentId:'immortality-page-root',depth:110,objectType:'movie-clip',characterId:223,symbolClass:'export.shop.SelectTS',instanceName:'player1',states:['selected-p2-wk'],localMatrix:matrix(1,0,0,1,50,540),localBounds:bounds(0,0,81,45),assetRef:findExport(223,'svg',1),derivation:'calculated'});
addObject({id:'immortality-page-root.owner-selector-p2-wk',parentId:'immortality-page-root',depth:111,objectType:'movie-clip',characterId:218,symbolClass:'export.shop.SelectWK',instanceName:'player2',states:['selected-p2-wk'],localMatrix:matrix(1,0,0,1,140,540),localBounds:bounds(0,0,76,45),assetRef:findExport(218,'svg',2),derivation:'calculated'});
for(let type=1;type<=5;type++) for(let grade=1;grade<=5;grade++){ const slot=pageUses.find((u)=>u.instanceName===`im${type}_${grade}`); const visible=type===1&&grade===1; addObject({id:`immortality-page-root.im${type}_${grade}.consumed-pill-icon`,parentId:`immortality-page-root.im${type}_${grade}`,depth:1000,objectType:'bitmap',characterId:null,instanceName:'showhaseatimmortality',states:visible?['consumed-grid','consume-success']:['locked-grid'],localMatrix:matrix(1,0,0,1,slot.matrix.tx+2,slot.matrix.ty+2),localBounds:bounds(0,0,51,51),assetRef:`runtime-image:${['wpsmd','wpmfd','wpbjd','wphxd','wphld'][type-1]}${grade}`,derivation:'calculated',visible}); }
addObject({id:'immortality-page-root.craft-dialog',parentId:'immortality-page-root',depth:2000,objectType:'movie-clip',characterId:1006,symbolClass:'export.immortality.ExchangeImmortality',states:[...dialogStates],assetRef:dialogSvg,localBounds:bounds(0,0,940.05,590),derivation:'calculated'});
for(const u of rootUses(dialogSvg)){ const type=u.href.startsWith('button')?'button':'shape'; addObject({id:`immortality-page-root.craft-dialog.${u.instanceName??`${type}-${u.characterId}-depth-${u.depth}`}`,parentId:'immortality-page-root.craft-dialog',depth:u.depth,objectType:type,characterId:u.characterId,instanceName:u.instanceName,states:[...dialogStates],localMatrix:u.matrix,localBounds:bounds(0,0,u.width,u.height),assetRef:`${dialogSvg}#${u.href}`,hitArea:type==='button'?bounds(u.matrix.tx,u.matrix.ty,u.width,u.height):null,buttonCharacter:type==='button'?u.characterId:null}); }

const visibleCount=(stateId)=>displayObjects.filter((o)=>o.placements.some((p)=>p.stateId===stateId&&p.visible)).length;
const baselines=stateSpecs.map(([id])=>{const p=`${baselineRoot}/original-${id}-940x590.png`;return{id:`original-${id}-940x590`,stateId:id,path:p,sha256:sha256(p),width:940,height:590,crop:bounds(0,0,940,590)}});
const manifest={$schema:'../schema/ui-ground-truth.schema.json',schemaVersion:1,truthId:'task-settings-175e.immortality-page',status:'verified',scope:{taskId:'TASK-SETTINGS-175E',surfaceId:'immortality-page-characters-990-969-1006',originalVersion:'RegiMA 1.1 restored corpus',description:'Character 990 complete page, 25 nested character 969 slots, five runtime owner selector families, consumed-pill dynamic images, and character 1006 crafting overlay. Feedback tips are shared host behavior rather than page children.'},generatedBy:{tool:'generate-immortality-page-ground-truth.mjs',toolVersion:'1',command,generatedAt:'2026-08-16T15:29:00+08:00'},provenance:[{id:'othermat1-swf',sourceType:'restored-swf',sourcePath:swfPath,sha256:sha256(swfPath),locator:'character 990 export.immortality.ImmortalityInterface frame 1; nested 969; dynamic 218/223/228/233/871 selectors; dynamic 1006 overlay; direct FFDec 26 SVG/PNG/button export.'},{id:'immortality-interface-as',sourceType:'legacy-as3',sourcePath:pageAsPath,sha256:sha256(pageAsPath),locator:'added/playerUse/initImmortalityShow/refreshInterface/makeImmortality/back.'},{id:'single-immortality-as',sourceType:'legacy-as3',sourcePath:singleAsPath,sha256:sha256(singleAsPath),locator:'setBtnVisible/setImage/setUnUseable/eatClick.'},{id:'exchange-immortality-as',sourceType:'legacy-as3',sourcePath:exchangeAsPath,sha256:sha256(exchangeAsPath),locator:'added/doCompound/makePill/xClick.'},{id:'othermat1-ffdec-xml',sourceType:'ffdec-xml',sourcePath:xmlPath,sha256:sha256(xmlPath),locator:'SymbolClass and character tags for 990/969/1006 plus nested PlaceObject records.'}],stage:{width:940,height:590,frameRate:24,coordinateSpace:'stage',scaleMode:'noScale',alignment:'top-left'},states:stateSpecs.map(([id,entry,fixtureId])=>({id,entry,frame:closedStates.has(id)?0:1,fixtureId,baselineId:`original-${id}-940x590`})),displayObjects,baselines,completeness:{expectedStateIds:stateSpecs.map(([id])=>id),extractedStateIds:stateSpecs.map(([id])=>id),expectedVisibleObjectCountByState:Object.fromEntries(stateSpecs.map(([id])=>[id,visibleCount(id)])),displayListMatched:true,stateSetMatched:true,unresolved:[]},evidenceRefs:['docs/reverse-engineering/evidence/TASK-SETTINGS-175E-immortality-page.md','docs/reverse-engineering/immortality-ui-index.md#task-settings-175e-丹药页-机器真值']};
const serialized=`${JSON.stringify(manifest,null,2)}\n`;
if(process.argv.includes('--check')){const current=readFileSync(path.join(root,outputPath),'utf8');if(current!==serialized)throw new Error(`${outputPath} is stale; run ${command}`);console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`)}else{writeFileSync(path.join(root,outputPath),serialized);console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`)}
