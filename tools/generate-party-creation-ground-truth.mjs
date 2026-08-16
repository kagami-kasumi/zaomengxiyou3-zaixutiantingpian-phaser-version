import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175i-party-creation.json';
const evidenceRoot = 'docs/tasks/evidence/TASK-SETTINGS-175I';
const swfPath = 'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf';
const commonSwfPath = 'local-resources/regima/source/restored-swfs/assets/Common1.swf';
const gameMenuAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/GameMenu.as';
const selectRoleAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/SelectRole.as';
const command = 'npm run generate:party-creation-truth';
const sha256 = (p) => createHash('sha256').update(readFileSync(path.join(root, p))).digest('hex');
const round = (n) => Math.round(n * 1000) / 1000;
const matrix = (tx = 0, ty = 0, a = 1, d = 1) => ({ a, b: 0, c: 0, d, tx: round(tx), ty: round(ty) });
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const numberStates = ['number-normal','number-1p-hover','number-1p-pressed','number-2p-hover','number-2p-pressed','number-back-hover','number-back-pressed'];
const roleStates = ['role-normal-p1'];
for (let role = 1; role <= 5; role += 1) roleStates.push(`role${role}-hover-p1`,`role${role}-pressed-p1`,`role${role}-selected-p1`);
roleStates.push('two-player-p1-role1-selected-p2-role2-hover');
const exitStates = ['number-cancelled','role-cancelled','complete-1p','complete-2p','reloaded-1p','reloaded-2p'];
const stateIds = [...numberStates, ...roleStates, ...exitStates];
const stateEntry = {
  'number-normal':'New game reveals original 1P, 2P and back controls while hiding the main-menu controls.',
  'number-1p-hover':'Pointer over original simpleGame button.','number-1p-pressed':'Pointer held on original simpleGame button.',
  'number-2p-hover':'Pointer over original doubleGame button.','number-2p-pressed':'Pointer held on original doubleGame button.',
  'number-back-hover':'Pointer over original back button.','number-back-pressed':'Pointer held on original back button.',
  'role-normal-p1':'Character 901 opens for P1 with five grayscale cards.',
  'two-player-p1-role1-selected-p2-role2-hover':'P1 Role1 remains selected; P2 may only hover another card and sees the original 2P marker.',
  'number-cancelled':'Original back returns to the main menu; the modern draft remains unwritten.',
  'role-cancelled':'Modern Escape-only exception removes the role surface without adding an original-visible control.',
  'complete-1p':'Final P1 role click removes character 901; modern atomic profile creation is a flow mapping.',
  'complete-2p':'Final P2 role click removes character 901; modern atomic profile creation is a flow mapping.',
  'reloaded-1p':'Reload restores the modern one-player profile without reopening original selection UI.',
  'reloaded-2p':'Reload restores the modern two-player profile without reopening original selection UI.',
};
for (let role = 1; role <= 5; role += 1) {
  stateEntry[`role${role}-hover-p1`] = `P1 hovers Role${role}; original color card and 1P marker are visible.`;
  stateEntry[`role${role}-pressed-p1`] = `P1 presses Role${role}; down shares the original color visual.`;
  stateEntry[`role${role}-selected-p1`] = `Role${role} persists as selected by assigning upState=downState; no marker remains.`;
}
const states = stateIds.map((id) => ({id,entry:stateEntry[id],frame:exitStates.includes(id)?0:1,fixtureId:id,baselineId:`original-${id}-940x590`}));
const displayObjects = [];
const render = (assetRef, extra = {}) => ({assetRef,blendMode:'normal',filters:[],maskId:null,...extra});
const placement = (stateId, localMatrix, localBounds, stageBounds, evidenceRefs, extra = {}) => ({stateId,visible:extra.visible ?? true,localMatrix,registrationPoint:{x:0,y:0},localBounds,stageBounds,derivation:extra.derivation ?? 'extracted',derivationMethod:extra.derivationMethod ?? 'Restored-SWF display-list geometry recorded by the existing selective export and cross-checked against the original 940x590 runtime audit.',evidenceRefs,...(extra.hitArea?{hitArea:extra.hitArea}:{})});
function addObject({id,parentId,depth,objectType,characterId,symbolClass=null,instanceName=null,stateIds:ids,localMatrix=matrix(),localBounds,stageBounds=localBounds,assetRef,provenanceId='othermat1-swf',buttonStateAssets,hitArea,visible=true}) {
  displayObjects.push({id,parentId,depth,objectType,sourceIdentity:{provenanceId,characterId,symbolClass,instanceName,frame:1},placements:ids.map((stateId)=>placement(stateId,localMatrix,localBounds,stageBounds,[`${provenanceId}:character-${characterId}-frame-1`],{hitArea,visible})),render:render(assetRef,{...(buttonStateAssets?{buttonStateAssets}:{})})});
}
addObject({id:'number-root',parentId:null,depth:0,objectType:'movie-clip',characterId:1149,symbolClass:'export.GameMenu',stateIds:numberStates,localBounds:bounds(0,0,940,590),assetRef:'public/assets/ui/save-party/select-number-up.png'});
const numberButtons = [
  ['simpleGame',1111,3,bounds(510.6,174.2,481.1,46.8),'select-number-1p-over.png','select-number-1p-down.png'],
  ['doubleGame',1115,6,bounds(751.15,250.75,110,40),'select-number-2p-over.png','select-number-2p-down.png'],
  ['backbtn',1136,23,bounds(750.6,301.5,98.7,27.6),'select-number-back-over.png','select-number-back-down.png'],
];
for (const [name,characterId,depth,hit,over,down] of numberButtons) addObject({id:`number-root.${name}`,parentId:'number-root',depth,objectType:'button',characterId,instanceName:name,stateIds:numberStates,localMatrix:matrix(hit.left,hit.top),localBounds:bounds(0,0,hit.width,hit.height),stageBounds:hit,hitArea:hit,assetRef:'public/assets/ui/save-party/select-number-up.png',buttonStateAssets:{up:'public/assets/ui/save-party/select-number-up.png',over:`public/assets/ui/save-party/${over}`,down:`public/assets/ui/save-party/${down}`,hit:`OtherMat1.swf:character-${characterId}-hit`}});
for (const [name,characterId,depth] of [['newGame',1144,8],['continueGame',1140,11],['gameHelp',1123,14],['aboutUs',1127,17],['btnquit',1132,20],['btn_like',1148,26]]) addObject({id:`number-root.${name}`,parentId:'number-root',depth,objectType:'button',characterId,instanceName:name,stateIds:numberStates,localMatrix:matrix(1110,0),localBounds:bounds(0,0,0,0),stageBounds:bounds(1110,0,0,0),assetRef:`OtherMat1.swf:character-${characterId}`,visible:false});

addObject({id:'role-root',parentId:null,depth:0,objectType:'movie-clip',characterId:901,symbolClass:'export.SelectRole',stateIds:roleStates,localBounds:bounds(0,0,940,590),assetRef:'public/assets/ui/save-party/select-role-up.png'});
const roleData = [
  [1,877,1,118.05,291.75,1.0038,0,263,bounds(0.76,0,188.06,590)],
  [2,883,21,306.4,290.85,1.0038,188,255,bounds(188.71,0,188.01,590)],
  [3,888,64,494.2,290.85,1.0038,376,277,bounds(376.51,0,188.01,590)],
  [4,894,95,682,290.75,1.0038,564,285,bounds(564.31,0,188.01,590)],
  [5,900,126,870.2,290.75,0.984,752,341,bounds(754.82,0,184.31,590)],
];
for (const [role,characterId,depth,tx,ty,scaleX,imageX,imageWidth,hit] of roleData) {
  const ids = roleStates;
  addObject({id:`role-root.btn${role}`,parentId:'role-root',depth,objectType:'button',characterId,instanceName:`btn${role}`,stateIds:ids,localMatrix:matrix(tx,ty,scaleX,1),localBounds:bounds((imageX-tx)/scaleX,-ty,imageWidth/scaleX,590),stageBounds:bounds(imageX,0,imageWidth,590),hitArea:hit,assetRef:`public/assets/ui/save-party/role${role}-1_up.png`,buttonStateAssets:{up:`public/assets/ui/save-party/role${role}-1_up.png`,over:`public/assets/ui/save-party/role${role}-2_over.png`,down:`public/assets/ui/save-party/role${role}-3_down.png`,hit:`local-resources/regima/task-outputs/task-settings-065-save-party/select-role-children/buttons/DefineButton2_${characterId}/4_hittest.png`}});
}
addObject({id:'role-root.name-prompt',parentId:'role-root',depth:20,objectType:'text-field',characterId:878,instanceName:null,stateIds:roleStates,localMatrix:matrix(252.05,571.5),localBounds:bounds(-2,-2,104,16.05),stageBounds:bounds(250.05,569.5,104,16.05),assetRef:'OtherMat1.swf:character-878'});
addObject({id:'role-root.username',parentId:'role-root',depth:94,objectType:'text-field',characterId:889,instanceName:'username',stateIds:roleStates,localMatrix:matrix(386.1,539.05),localBounds:bounds(12.9,-2,142,30.95),stageBounds:bounds(399,537.05,142,30.95),assetRef:'OtherMat1.swf:character-889'});
addObject({id:'role-root.empty-btn5',parentId:'role-root',depth:124,objectType:'button',characterId:895,instanceName:'btn5',stateIds:roleStates,localMatrix:matrix(870.65,344.7),localBounds:bounds(0,0,0,0),stageBounds:bounds(870.65,344.7,0,0),assetRef:'OtherMat1.swf:character-895',visible:false});
const markerStates = roleStates.filter((id)=>id.includes('-hover-'));
displayObjects.push({id:'role-root.owner-marker',parentId:'role-root',depth:1000,objectType:'bitmap',sourceIdentity:{provenanceId:'select-role-as',characterId:null,symbolClass:null,instanceName:'arrow1-or-arrow2',frame:1},placements:markerStates.map((stateId)=>{const role=stateId.startsWith('two-player')?2:Number(stateId.match(/^role(\d)/)?.[1]); const p2=stateId.startsWith('two-player'); const x=roleData[role-1][3]-50; return placement(stateId,matrix(x,40),bounds(0,0,84,84),bounds(x,40,84,84),['select-role-as:over'],{derivation:'calculated',derivationMethod:'SelectRole.over() places image curSelected+P at current card x-50, y=40.'});}),render:render('public/assets/ui/save-party/marker-p1.png',{buttonStateAssets:{up:'public/assets/ui/save-party/marker-p1.png',over:'public/assets/ui/save-party/marker-p2.png',down:'public/assets/ui/save-party/marker-p2.png',hit:'public/assets/ui/save-party/marker-p2.png'}})});

const baselines = states.map(({id})=>{const p=`${evidenceRoot}/original-${id}-940x590.png`; return {id:`original-${id}-940x590`,stateId:id,path:p,sha256:sha256(p),width:940,height:590,crop:bounds(0,0,940,590)};});
const visibleCount = (stateId) => displayObjects.filter((object)=>object.placements.some((p)=>p.stateId===stateId&&p.visible)).length;
const manifest = {$schema:'../schema/ui-ground-truth.schema.json',schemaVersion:1,truthId:'task-settings-175i.party-creation',status:'verified',scope:{taskId:'TASK-SETTINGS-175I',surfaceId:'party-creation-characters-1149-901',originalVersion:'RegiMA 1.1 restored corpus',description:'Character 1149 player-count state and character 901 five-card role selection, including hidden main-menu controls, native button states, selected persistence, owner markers, hit columns, single/two-player ordering, cancellation and modern atomic-profile flow mapping.'},generatedBy:{tool:'generate-party-creation-ground-truth.mjs',toolVersion:'1',command,generatedAt:'2026-08-16T23:55:00+08:00'},provenance:[
  {id:'othermat1-swf',sourceType:'restored-swf',sourcePath:swfPath,sha256:sha256(swfPath),locator:'character 1149 export.GameMenu and character 901 export.SelectRole; nested 1111/1115/1136, 877/883/888/894/895/900, 878/889, images 108/115.'},
  {id:'common1-swf',sourceType:'restored-swf',sourcePath:commonSwfPath,sha256:sha256(commonSwfPath),locator:'characters 69/18 shared entry cross-check only; no visual geometry derived from this source.'},
  {id:'game-menu-as',sourceType:'legacy-as3',sourcePath:gameMenuAs,sha256:sha256(gameMenuAs),locator:'added/backClick/newGameClick/showSelectNum/selectNum/showMenu; showSelectNum moves 1P/2P/back in and six main-menu controls to x=1110.'},
  {id:'select-role-as',sourceType:'legacy-as3',sourcePath:selectRoleAs,sha256:sha256(selectRoleAs),locator:'added/over/out/onClick/newRole/selectOver; marker placement, listener removal, upState=downState, P1 then P2 ordering and final selection.'}
],stage:{width:940,height:590,frameRate:30,coordinateSpace:'stage',scaleMode:'noScale',alignment:'top-left'},states,displayObjects,baselines,completeness:{expectedStateIds:stateIds,extractedStateIds:stateIds,expectedVisibleObjectCountByState:Object.fromEntries(stateIds.map((id)=>[id,visibleCount(id)])),displayListMatched:true,stateSetMatched:true,unresolved:[]},evidenceRefs:['docs/reverse-engineering/evidence/TASK-SETTINGS-175I-party-creation.md','docs/reverse-engineering/save-party-flow-index.md#4-人数页显示列表','docs/reverse-engineering/save-party-flow-index.md#5-角色页显示列表与视觉基准','docs/reverse-engineering/evidence/TASK-SETTINGS-175-functional-ui-truth-audit.md']};
const serialized = `${JSON.stringify(manifest,null,2)}\n`;
if (process.argv.includes('--check')) { const current=readFileSync(path.join(root,outputPath),'utf8'); if(current!==serialized) throw new Error(`${outputPath} is stale; run ${command}`); console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${states.length} states.`); }
else { writeFileSync(path.join(root,outputPath),serialized); console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${states.length} states.`); }
