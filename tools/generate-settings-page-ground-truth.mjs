import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf';
const taskOutput = 'local-resources/regima/task-outputs/task-settings-066-map-services';
const svgPath = `${taskOutput}/svg/settings/DefineSprite_148_export.setmenu.gameSetting/1.svg`;
const xmlPath = `${taskOutput}/deep-settings/StageCommon.xml`;
const buttonPath = `${taskOutput}/deep-settings/buttons/DefineButton2_144/combined.svg`;
const pageAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/setmenu/gameSetting.as';
const mapMenuAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/MapMenu.as';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175g-settings-page.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175G';
const command = 'npm run generate:settings-page-truth';

const stateSpecs = [
  ['normal-default','Map settings opens with original defaults','difficulty=normal; bgm=on; skill=on; quality=high; defaultVol=example'],
  ['difficulty-hover','Pointer rolls over difficulty','hover=difficulty; textColor=#ffff00'],
  ['difficulty-pressed','Pointer is held on difficulty; no distinct pressed visual','pressed=difficulty; visual=hover'],
  ['difficulty-hard','Difficulty first click','difficulty=hard'],['difficulty-hell','Difficulty second click','difficulty=hell'],
  ['difficulty-normal-cycle','Difficulty third click wraps','difficulty=normal'],
  ['bgm-hover','Pointer rolls over background music','hover=bgmStay'],['bgm-pressed','Pointer held on background music','pressed=bgmStay; visual=hover'],
  ['bgm-off','Background music disabled','bgm=off; loop channel stopped'],['bgm-on-cycle','Background music wraps on','bgm=on; begin loop'],
  ['skill-off','Skill sound disabled','skill=off'],['skill-on-cycle','Skill sound wraps on','skill=on'],
  ['quality-medium','Quality first click','frameClips=24; stage.frameRate=24'],['quality-low','Quality second click','frameClips=20; stage.frameRate=20'],
  ['quality-high-cycle','Quality third click wraps','frameClips=30; stage.frameRate=30'],
  ['default-volume-hover','Pointer rolls over dead default-volume control','hover=defaultVol'],
  ['default-volume-pressed','Pointer held on dead control; no distinct pressed visual','pressed=defaultVol; visual=hover'],
  ['default-volume-dead-click','Dead control click only emits original alert','defaultVol=example; no state mutation'],
  ['close-hover','Pointer over character 144','close=over'],['close-pressed','Pointer down on character 144','close=down'],
  ['overlay-blocked','Full-stage character 134 intercepts map pointer input','underlay pointer blocked'],
  ['closed','Character 148 removed; existing map resumes','page removed'],
  ['reopened-session','New character 148 reads current shared session values','reopened; previous four values retained'],
];
const openStates = stateSpecs.map(([id]) => id).filter((id) => id !== 'closed');

const sha256 = (p) => createHash('sha256').update(readFileSync(path.join(root, p))).digest('hex');
const round = (n) => Math.round(n * 1000) / 1000;
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a=1,b=0,c=0,d=1,tx=0,ty=0) => ({ a:round(a),b:round(b),c:round(c),d:round(d),tx:round(tx),ty:round(ty) });
const render = (assetRef, extra={}) => ({ assetRef, blendMode:'normal', filters:[], maskId:null, ...extra });
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1],m[2]]));
const placement = (stateId, localMatrix, localBounds, stageBounds, evidenceRefs, extra={}) => ({
  stateId, visible:true, localMatrix, registrationPoint:{x:0,y:0}, localBounds, stageBounds,
  derivation:'extracted', derivationMethod:'Direct restored-SWF PlaceObject matrix and FFDec SVG visible envelope.', evidenceRefs, ...extra,
});

const svg = readFileSync(path.join(root, svgPath), 'utf8');
const rootGroup = svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/)?.[1];
if (!rootGroup) throw new Error('Unable to locate character 148 root display list');
const uses = [...rootGroup.matchAll(/<use\b[^>]*\/>/g)].map((entry) => {
  const a = attrs(entry[0]);
  const values = a.transform.match(/matrix\(([^)]*)\)/)[1].split(',').map(Number);
  return { characterId:Number(a['ffdec:characterId']), instanceName:a.id??null, href:a['xlink:href'].slice(1), width:Number(a.width), height:Number(a.height), matrix:matrix(...values) };
});

const xml = readFileSync(path.join(root, xmlPath), 'utf8');
const start = xml.indexOf('<item type="DefineSpriteTag" forceWriteAsLong="true" frameCount="1" hasEndTag="true" spriteId="148">');
const end = xml.indexOf('<item type="ShowFrameTag"', start);
if (start < 0 || end < 0) throw new Error('Unable to locate character 148 in FFDec XML');
const placements = [...xml.slice(start,end).matchAll(/<item type="PlaceObject2Tag"([^>]*)>\s*<matrix([^>]*)\/>/g)].map((entry) => {
  const p=attrs(entry[1]), m=attrs(entry[2]); const hasScale=m.hasScale==='true';
  return { characterId:Number(p.characterId), instanceName:p.name??null, depth:Number(p.depth), matrix:matrix(hasScale?Number(m.scaleX):1,0,0,hasScale?Number(m.scaleY):1,Number(m.translateX)/20,Number(m.translateY)/20) };
});
if (uses.length !== 12 || placements.length !== 12) throw new Error(`148 display-list mismatch: SVG=${uses.length}, XML=${placements.length}`);
uses.forEach((use,index) => {
  const raw=placements[index];
  const matrixMatches=Object.keys(use.matrix).every((key)=>Math.abs(use.matrix[key]-raw.matrix[key])<=0.002);
  if (use.characterId!==raw.characterId || use.instanceName!==raw.instanceName || !matrixMatches) throw new Error(`148 child mismatch at ${index}: SVG=${JSON.stringify(use)} XML=${JSON.stringify(raw)}`);
  use.depth=raw.depth;
});

const displayObjects = [];
function addObject({id,parentId,depth,objectType,characterId,instanceName=null,states=openStates,localMatrix=matrix(),localBounds,stageBounds,assetRef,provenanceId='stage-common-swf',extraPlacement={},extraRender={}}) {
  displayObjects.push({ id,parentId,depth,objectType,sourceIdentity:{provenanceId,characterId,symbolClass:null,instanceName,frame:1},
    placements:states.map((stateId)=>placement(stateId,localMatrix,localBounds,stageBounds,[`${provenanceId}:character-${characterId}-frame-1`],extraPlacement)),
    render:render(assetRef,extraRender) });
}
addObject({id:'settings-page-root',parentId:null,depth:0,objectType:'movie-clip',characterId:148,states:openStates,localBounds:bounds(0,0,940,590),stageBounds:bounds(0,0,940,590),assetRef:svgPath});
for (const use of uses) {
  const isButton=use.characterId===144, isField=use.characterId===146, isText=[136,137,138,139,147].includes(use.characterId);
  const objectType=isButton?'button':isField?'movie-clip':isText?'text-field':'sprite';
  const id=`settings-page-root.${use.instanceName??`${objectType}-${use.characterId}-depth-${use.depth}`}`;
  const stageBounds=bounds(use.matrix.tx,use.matrix.ty,use.width*Math.abs(use.matrix.a),use.height*Math.abs(use.matrix.d));
  addObject({id,parentId:'settings-page-root',depth:use.depth,objectType,characterId:use.characterId,instanceName:use.instanceName,localMatrix:use.matrix,localBounds:bounds(0,0,use.width,use.height),stageBounds,assetRef:`${svgPath}#${use.href}`,
    extraPlacement:isButton?{hitArea:bounds(590,133.95,40,40)}:isField?{hitArea:stageBounds}:{},
    extraRender:isButton?{buttonStateAssets:{up:`${buttonPath}#up`,over:`${buttonPath}#over`,down:`${buttonPath}#down`,hit:`${buttonPath}#hit`}}:isText?{textStyle:{fontFamily:'FZCuYuan-M03',fontSize:22,color:'#ffffff',dynamic:false}}:{} });
  if (isField) {
    addObject({id:`${id}.txt`,parentId:id,depth:1,objectType:'text-field',characterId:145,instanceName:'txt',localMatrix:matrix(1,0,0,1,2,2),localBounds:bounds(-2,-2,104,34.1),stageBounds,assetRef:`${svgPath}#text4`,extraRender:{textStyle:{fontFamily:'FZCuYuan-M03',fontSize:25,color:'#ffffff',hoverColor:'#ffff00',dynamic:true,source:use.instanceName==='defaultVol'?'timeline placeholder 示例; refreshTxt has no assignment':`gameSetting.refreshTxt.${use.instanceName}`}}});
  }
  if (use.characterId===134) addObject({id:`${id}.full-stage-hit-shape`,parentId:id,depth:1,objectType:'shape',characterId:133,localMatrix:matrix(),localBounds:bounds(0,0,940,590),stageBounds:bounds(0,0,940,590),assetRef:`${svgPath}#shape0`});
}

const visibleCount = (stateId) => displayObjects.filter((object) => object.placements.some((p) => p.stateId===stateId)).length;
const baselines = stateSpecs.map(([id]) => { const p=`${baselineRoot}/original-${id}-940x590.png`; return {id:`original-${id}-940x590`,stateId:id,path:p,sha256:sha256(p),width:940,height:590,crop:bounds(0,0,940,590)}; });
const manifest = {$schema:'../schema/ui-ground-truth.schema.json',schemaVersion:1,truthId:'task-settings-175g.settings-page',status:'verified',scope:{taskId:'TASK-SETTINGS-175G',surfaceId:'settings-page-character-148',originalVersion:'RegiMA 1.1 restored corpus',description:'Character 148 complete display list, nested five value fields, character 144 button states, full-stage modal hit surface, four setting cycles and the inert default-volume control. Cross-restart persistence is a user-approved modern exception and is not an original display object.'},generatedBy:{tool:'generate-settings-page-ground-truth.mjs',toolVersion:'1',command,generatedAt:'2026-08-16T21:30:00+08:00'},provenance:[
  {id:'stage-common-swf',sourceType:'restored-swf',sourcePath:swfPath,sha256:sha256(swfPath),locator:'character 148 export.setmenu.gameSetting; nested 134/136..147; frame 1.'},
  {id:'stage-common-ffdec-xml',sourceType:'ffdec-xml',sourcePath:xmlPath,sha256:sha256(xmlPath),locator:'DefineSprite 148 PlaceObject depths/matrices and nested character/button definitions.'},
  {id:'game-setting-as',sourceType:'legacy-as3',sourcePath:pageAsPath,sha256:sha256(pageAsPath),locator:'constructor, __added/__removed, react, five __setProp handlers and refreshTxt.'},
  {id:'map-menu-as',sourceType:'legacy-as3',sourcePath:mapMenuAsPath,sha256:sha256(mapMenuAsPath),locator:'huodongClick creates export.setmenu::gameSetting and adds it directly to gc.stage.'}
],stage:{width:940,height:590,frameRate:30,coordinateSpace:'stage',scaleMode:'noScale',alignment:'top-left'},states:stateSpecs.map(([id,entry,fixtureId])=>({id,entry,frame:id==='closed'?0:1,fixtureId,baselineId:`original-${id}-940x590`})),displayObjects,baselines,completeness:{expectedStateIds:stateSpecs.map(([id])=>id),extractedStateIds:stateSpecs.map(([id])=>id),expectedVisibleObjectCountByState:Object.fromEntries(stateSpecs.map(([id])=>[id,visibleCount(id)])),displayListMatched:true,stateSetMatched:true,unresolved:[]},evidenceRefs:['docs/reverse-engineering/evidence/TASK-SETTINGS-175G-settings-page.md','docs/reverse-engineering/settings-ui-index.md#task-settings-175g-设置页机器真值','docs/reverse-engineering/evidence/TASK-SETTINGS-175-functional-ui-truth-audit.md']};
const serialized=`${JSON.stringify(manifest,null,2)}\n`;
if (process.argv.includes('--check')) { const current=readFileSync(path.join(root,outputPath),'utf8'); if(current!==serialized) throw new Error(`${outputPath} is stale; run ${command}`); console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`); }
else { writeFileSync(path.join(root,outputPath),serialized); console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`); }
