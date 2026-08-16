import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/backpack1.swf';
const taskOutput = 'local-resources/regima/task-outputs/task-settings-066-map-services';
const rootSvg = `${taskOutput}/svg/shop-task/DefineSprite_85_export.taskInterface.TaskInterface/1.svg`;
const tileFrame1 = `${taskOutput}/deep-task/sprites/DefineSprite_60_export.taskInterface.TaskTile/1.svg`;
const tileFrame2 = `${taskOutput}/deep-task/sprites/DefineSprite_60_export.taskInterface.TaskTile/2.svg`;
const awardSvg = `${taskOutput}/deep-task/sprites/DefineSprite_73_export.taskInterface.AwardList/1.svg`;
const taskAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/taskInterface/TaskInterface.as';
const tileAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/taskInterface/TaskTile.as';
const awardAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/taskInterface/AwardList.as';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175h-task-page.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175H';
const command = 'npm run generate:task-page-truth';

const states = [
  ['daily-initial','Daily tab opens page 1 with five rows and no selection','tab=daily; page=1/9; selected=none',5,0],
  ['daily-tab-hover','Pointer over daily tab; no distinct hover frame','tab=daily; hover=daily; visual=selected',5,0],
  ['daily-tab-pressed','Pointer held on daily tab; no distinct pressed frame','tab=daily; pressed=daily; visual=selected',5,0],
  ['activity-tab-hover','Pointer over activity tab before click; no distinct hover frame','tab=daily; hover=activity; visual=normal',5,0],
  ['activity-tab-pressed','Pointer held on activity tab before click; no distinct pressed frame','tab=daily; pressed=activity; visual=normal',5,0],
  ['daily-selected','Incomplete daily row selected with two candidate rewards','tab=daily; page=1/9; selectedRow=1; complete=false',5,2],
  ['tile-hover','Pointer over selected tile; tile has no hover frame','selectedRow=1; hover=row1; visual=selected',5,2],
  ['tile-pressed','Pointer held on selected tile; tile has no pressed frame','selectedRow=1; pressed=row1; visual=selected',5,2],
  ['completed-unclaimed','Completed row selected and claim control enabled','selectedRow=1; complete=true; claimed=false; claimFrame=2',5,2],
  ['claim-pressed','Claim control held; MovieClip has no independent pressed frame','selectedRow=1; complete=true; pressed=claim; visual=enabled',5,2],
  ['claimed-selected','Claimed row selected with dynamic character 9 stamp','selectedRow=1; claimed=true; claimFrame=1',5,2,1],
  ['claimed-p1-p2','Shared claimed state after two-player reward distribution','players=2; selectedRow=1; claimed=true',5,2,1],
  ['reward-three-candidates','Selected task exposes three runtime reward icons','selectedRow=1; candidates=3',5,3],
  ['reward-four-candidates','Selected task exposes four runtime reward icons','selectedRow=1; candidates=4',5,4],
  ['previous-hover','Pointer over previous-page DefineButton2','page=2/9; previous=over',5,2],
  ['previous-pressed','Pointer down on previous-page DefineButton2','page=2/9; previous=down',5,2],
  ['next-hover','Pointer over next-page DefineButton2','page=1/9; next=over',5,2],
  ['next-pressed','Pointer down on next-page DefineButton2','page=1/9; next=down',5,2],
  ['daily-page2-same-row','Paging preserves selectId and auto-selects the same row','tab=daily; page=2/9; selectedRow=1',5,2],
  ['daily-last-page-three-tiles','Daily page 9 contains only three visible rows','tab=daily; page=9/9; selectedRow=1',3,1],
  ['daily-last-page-stale-row4','Hidden selected row leaves prior detail and rewards visible','tab=daily; page=9/9; selectId=4; staleDetail=true',3,2],
  ['next-last-boundary','Next remains enabled-looking and clamps at page 9','tab=daily; page=9/9; next=down; clamped=true',3,1],
  ['activity-empty','Activity click selects activity and hides all five rows','tab=activity; page=1/1; selected=none',0,0],
  ['activity-empty-stale-detail','Empty activity page retains prior daily detail, rewards and claim listener','tab=activity; page=1/1; staleDailySelection=true',0,2],
  ['close-hover','Pointer over character 31','close=over',5,0],
  ['close-pressed','Pointer down on character 31','close=down',5,0],
  ['closed','Character 85 removed; map host resumes','page removed',0,0],
  ['reopened-daily','A new character 85 instance dispatches daily click','reopened; tab=daily; page=1/9; selected=none',5,0],
].map(([id,entry,fixtureId,tileCount,rewardCount,claimedTile=null])=>({id,entry,fixtureId,tileCount,rewardCount,claimedTile}));
const openStateIds = states.filter((s)=>s.id!=='closed').map((s)=>s.id);

const sha256 = (p) => createHash('sha256').update(readFileSync(path.join(root,p))).digest('hex');
const round = (n) => Math.round(n*1000)/1000;
const bounds = (left,top,width,height) => ({left:round(left),top:round(top),width:round(width),height:round(height)});
const matrix = (a=1,b=0,c=0,d=1,tx=0,ty=0) => ({a:round(a),b:round(b),c:round(c),d:round(d),tx:round(tx),ty:round(ty)});
const render = (assetRef,extra={}) => ({assetRef,blendMode:'normal',filters:[],maskId:null,...extra});
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m)=>[m[1],m[2]]));
function rootUses(svgPath) {
  const svg=readFileSync(path.join(root,svgPath),'utf8');
  const group=svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/)?.[1];
  if(!group) throw new Error(`Unable to locate root display list in ${svgPath}`);
  return [...group.matchAll(/<use\b[^>]*\/>/g)].map((entry)=>{const a=attrs(entry[0]); const v=a.transform.match(/matrix\(([^)]*)\)/)[1].split(',').map(Number); return {characterId:Number(a['ffdec:characterId']),instanceName:a.id??null,href:a['xlink:href'].slice(1),width:Number(a.width),height:Number(a.height),matrix:matrix(...v)};});
}
const expectedDepths=[5,6,8,10,12,14,17,20,23,26,30,31,32,35,36,39,42,45,47,49,50];
const expectedCharacters=[39,44,49,54,31,60,60,60,60,60,63,64,65,69,73,73,73,78,83,84,73];
const rootChildren=rootUses(rootSvg);
if(rootChildren.length!==21) throw new Error(`Character 85 root child count mismatch: ${rootChildren.length}`);
rootChildren.forEach((child,index)=>{child.depth=expectedDepths[index]; if(child.characterId!==expectedCharacters[index]) throw new Error(`Character 85 child ${index} expected ${expectedCharacters[index]}, received ${child.characterId}`);});
const tileChildren1=rootUses(tileFrame1), tileChildren2=rootUses(tileFrame2), awardChildren=rootUses(awardSvg);
if(JSON.stringify(tileChildren1.map((c)=>c.characterId))!==JSON.stringify([56,57]) || JSON.stringify(tileChildren2.map((c)=>c.characterId))!==JSON.stringify([59,57])) throw new Error('Character 60 two-frame display list mismatch');
if(JSON.stringify(awardChildren.map((c)=>c.characterId))!==JSON.stringify([71,72])) throw new Error('Character 73 display list mismatch');

const displayObjects=[];
const placement=(stateId,localMatrix,localBounds,stageBounds,derivation,evidenceRefs,extra={})=>({stateId,visible:true,localMatrix,registrationPoint:{x:0,y:0},localBounds,stageBounds,derivation,derivationMethod:derivation==='extracted'?'Direct FFDec SVG PlaceObject matrix and visible envelope exported from the restored SWF.':'AS3 runtime child position composed with its restored-SWF parent matrix.',evidenceRefs,...extra});
function addObject({id,parentId,depth,objectType,characterId,instanceName=null,stateIds,localMatrix=matrix(),localBounds,stageBounds=null,assetRef=null,derivation='extracted',provenanceId='backpack1-swf',hitArea=null,textStyle=null,buttonCharacter=null}){
  const resolved=stageBounds??bounds(localMatrix.tx,localMatrix.ty,localBounds.width*Math.abs(localMatrix.a),localBounds.height*Math.abs(localMatrix.d));
  const buttonStateAssets=buttonCharacter?{up:`${taskOutput}/deep-task/buttons/DefineButton2_${buttonCharacter}/combined.svg#up`,over:`${taskOutput}/deep-task/buttons/DefineButton2_${buttonCharacter}/combined.svg#over`,down:`${taskOutput}/deep-task/buttons/DefineButton2_${buttonCharacter}/combined.svg#down`,hit:`${taskOutput}/deep-task/buttons/DefineButton2_${buttonCharacter}/combined.svg#hit`}:undefined;
  displayObjects.push({id,parentId,depth,objectType,sourceIdentity:{provenanceId,characterId,symbolClass:characterId===85?'export.taskInterface.TaskInterface':characterId===60?'export.taskInterface.TaskTile':characterId===73?'export.taskInterface.AwardList':null,instanceName,frame:1},placements:stateIds.map((s)=>placement(s,localMatrix,localBounds,resolved,derivation,[`${provenanceId}:character-${characterId??'dynamic'}-frame-1`],hitArea?{hitArea}:{})),render:render(assetRef,{...(textStyle?{textStyle}:{}),...(buttonStateAssets?{buttonStateAssets}:{})})});
}
addObject({id:'task-page-root',parentId:null,depth:0,objectType:'movie-clip',characterId:85,stateIds:openStateIds,localBounds:bounds(0,0,940,590),stageBounds:bounds(0,0,940,590),assetRef:rootSvg});
const buttonIds=new Set([31,78,83]);
const textSources={64:'Task.getrwdict()',65:'Task.getTaskPro()',84:'curPage + "/" + allPage'};
const tileRoots=[]; const awardRoots=[];
for(const child of rootChildren){
  const type=buttonIds.has(child.characterId)?'button':textSources[child.characterId]?'text-field':[44,49,54,60,73].includes(child.characterId)?'movie-clip':'shape';
  const tileIndex=child.characterId===60?Number(child.instanceName.slice(1)):null;
  const stateIds=tileIndex?states.filter((s)=>s.id!=='closed'&&s.tileCount>=tileIndex).map((s)=>s.id):openStateIds;
  const id=`task-page-root.${child.instanceName??`${type}-${child.characterId}-depth-${child.depth}`}`;
  addObject({id,parentId:'task-page-root',depth:child.depth,objectType:type,characterId:child.characterId,instanceName:child.instanceName,stateIds,localMatrix:child.matrix,localBounds:bounds(0,0,child.width,child.height),assetRef:`${rootSvg}#${child.href}`,hitArea:buttonIds.has(child.characterId)?bounds(child.matrix.tx,child.matrix.ty,child.characterId===31?40:86,child.characterId===31?40:32):[44,49,54,60].includes(child.characterId)?bounds(child.matrix.tx,child.matrix.ty,child.width,child.height):null,textStyle:textSources[child.characterId]?{fontFamily:'FZCuYuan-M03',fontSize:15,color:'#ffffff',dynamic:true,source:textSources[child.characterId]}:null,buttonCharacter:buttonIds.has(child.characterId)?child.characterId:null});
  if(tileIndex) tileRoots.push({id,index:tileIndex,child,stateIds});
  if(child.characterId===73) awardRoots.push({id,index:Number(child.instanceName.slice(-1)),child,stateIds});
}
for(const tile of tileRoots){
  addObject({id:`${tile.id}.background`,parentId:tile.id,depth:1,objectType:'shape',characterId:56,instanceName:null,stateIds:tile.stateIds,localMatrix:tile.child.matrix,localBounds:bounds(0,0,204,40),assetRef:`${tileFrame1}#shape0`});
  addObject({id:`${tile.id}.rwnametxt`,parentId:tile.id,depth:2,objectType:'text-field',characterId:57,instanceName:'rwnametxt',stateIds:tile.stateIds,localMatrix:matrix(1,0,0,1,tile.child.matrix.tx+35,tile.child.matrix.ty+6.5),localBounds:bounds(0,0,160.95,30.5),assetRef:`${tileFrame1}#text0`,textStyle:{fontFamily:'FZCuYuan-M03',fontSize:22,color:'#ffffff',dynamic:true,source:`curAry[(curPage-1)*5+${tile.index-1}].getrwname()`}});
  const claimedStates=states.filter((s)=>s.claimedTile===tile.index).map((s)=>s.id);
  if(claimedStates.length) addObject({id:`${tile.id}.hasReceiveIcon`,parentId:tile.id,depth:1000,objectType:'bitmap',characterId:9,instanceName:'hasReceiveIcon',stateIds:claimedStates,localMatrix:matrix(1,0,0,1,tile.child.matrix.tx+150.5,tile.child.matrix.ty),localBounds:bounds(0,0,63,47),assetRef:'restored-swf-symbol:backpack1.swf#hasReceive',derivation:'calculated',provenanceId:'task-tile-as'});
}
for(const award of awardRoots){
  const visibleStates=states.filter((s)=>s.id!=='closed').map((s)=>s.id);
  addObject({id:`${award.id}.background`,parentId:award.id,depth:1,objectType:'shape',characterId:71,stateIds:visibleStates,localMatrix:award.child.matrix,localBounds:bounds(0,0,131,59),assetRef:`${awardSvg}#shape0`});
  addObject({id:`${award.id}.txtname`,parentId:award.id,depth:2,objectType:'text-field',characterId:72,instanceName:'txtname',stateIds:visibleStates,localMatrix:matrix(1,0,0,1,award.child.matrix.tx+57,award.child.matrix.ty+14.75),localBounds:bounds(0,0,70,34.9),assetRef:`${awardSvg}#text0`,textStyle:{fontFamily:'FZCuYuan-M03',fontSize:12,color:'#ffffff',dynamic:true,source:`selectTask.allaward[${award.index-1}].cname or empty`}});
  const iconStates=states.filter((s)=>s.rewardCount>=award.index).map((s)=>s.id);
  addObject({id:`${award.id}.runtime-icon`,parentId:award.id,depth:1000,objectType:'bitmap',characterId:null,instanceName:'runtimeAwardIcon',stateIds:iconStates,localMatrix:matrix(1,0,0,1,award.child.matrix.tx+3.5,award.child.matrix.ty+3.5),localBounds:bounds(0,0,50,50),assetRef:`EIcon1.swf:selectTask.allaward[${award.index-1}]`,derivation:'calculated',provenanceId:'award-list-as'});
}

const visibleCount=(stateId)=>displayObjects.filter((o)=>o.placements.some((p)=>p.stateId===stateId)).length;
const baselines=states.map((s)=>{const p=`${baselineRoot}/original-${s.id}-940x590.png`; return {id:`original-${s.id}-940x590`,stateId:s.id,path:p,sha256:sha256(p),width:940,height:590,crop:bounds(0,0,940,590)};});
const manifest={$schema:'../schema/ui-ground-truth.schema.json',schemaVersion:1,truthId:'task-settings-175h.task-page',status:'verified',scope:{taskId:'TASK-SETTINGS-175H',surfaceId:'task-page-character-85',originalVersion:'RegiMA 1.1 restored corpus',description:'Character 85 complete root display list, nested task rows and reward cells, three DefineButton2 controls, dynamic claimed/reward children, daily/activity pagination defects, shared claim state, close and reopen.'},generatedBy:{tool:'generate-task-page-ground-truth.mjs',toolVersion:'1',command,generatedAt:'2026-08-16T23:20:00+08:00'},provenance:[
  {id:'backpack1-swf',sourceType:'restored-swf',sourcePath:swfPath,sha256:sha256(swfPath),locator:'character 85 export.taskInterface.TaskInterface frame 1; nested 39/44/49/54/60/63/64/65/69/73/78/83/84 and button 31.'},
  {id:'task-interface-as',sourceType:'legacy-as3',sourcePath:taskAs,sha256:sha256(taskAs),locator:'added/removed, dailyClick/activityClick, setTaskList, selected, setAwardList, paging, analyseAward and closed.'},
  {id:'task-tile-as',sourceType:'legacy-as3',sourcePath:tileAs,sha256:sha256(tileAs),locator:'character 60 selected/unselected, rwnametxt, dynamic hasReceive character 9 at local x=150.5.'},
  {id:'award-list-as',sourceType:'legacy-as3',sourcePath:awardAs,sha256:sha256(awardAs),locator:'character 73 txtname and dynamic reward image at local (3.5,3.5).'}
],stage:{width:940,height:590,frameRate:30,coordinateSpace:'stage',scaleMode:'noScale',alignment:'top-left'},states:states.map((s)=>({id:s.id,entry:s.entry,frame:s.id==='closed'?0:1,fixtureId:s.fixtureId,baselineId:`original-${s.id}-940x590`})),displayObjects,baselines,completeness:{expectedStateIds:states.map((s)=>s.id),extractedStateIds:states.map((s)=>s.id),expectedVisibleObjectCountByState:Object.fromEntries(states.map((s)=>[s.id,visibleCount(s.id)])),displayListMatched:true,stateSetMatched:true,unresolved:[]},evidenceRefs:['docs/reverse-engineering/evidence/TASK-SETTINGS-175H-task-page.md','docs/reverse-engineering/task-ui-index.md#task-settings-175h-机器真值迁移','docs/reverse-engineering/evidence/TASK-SETTINGS-175-functional-ui-truth-audit.md']};
const serialized=`${JSON.stringify(manifest,null,2)}\n`;
if(process.argv.includes('--check')){const current=readFileSync(path.join(root,outputPath),'utf8'); if(current!==serialized) throw new Error(`${outputPath} is stale; run ${command}`); console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${states.length} states.`);} else {writeFileSync(path.join(root,outputPath),serialized); console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${states.length} states.`);}
