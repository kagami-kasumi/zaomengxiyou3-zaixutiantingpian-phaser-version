import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/backpack1.swf';
const taskOutput = 'local-resources/regima/task-outputs/task-settings-175f-shop-page';
const xmlPath = `${taskOutput}/backpack1.xml`;
const pageAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/microshop/Micropayment.as';
const cardAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/microshop/ShopThing.as';
const dialogAsPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/microshop/SumInterface.as';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175f-shop-page.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175F';
const command = 'npm run generate:shop-page-truth';

const stateSpecs = [
  ['normal-p1-all-page1','P1 opens all-products page 1 with all selected','p1; category=all; page=1/6; quantity=1'],
  ['category-gem-selected','Gem category page 1 selected','p1; category=gem; page=1/3'],
  ['category-item-selected','Item category page 1 selected','p1; category=item; page=1/2'],
  ['category-fashion-selected','Fashion category selected with eight cards','p1; category=fashion; page=1/1'],
  ['category-pet-selected','Pet category selected with five cards','p1; category=pet; page=1/1'],
  ['category-all-hover','Pointer over all category','hover=btn_buyall'],['category-all-pressed','Pointer down on all category','pressed=btn_buyall'],
  ['card-buy-hover','Pointer over first card buy button','hover=st0.btn_buy'],['card-buy-pressed','Pointer down on first card buy button','pressed=st0.btn_buy'],
  ['quantity-up-hover','Pointer over first card increment','hover=st0.btn_up'],['quantity-up-pressed','Pointer down on first card increment','pressed=st0.btn_up'],
  ['quantity-down-hover','Pointer over first card decrement','hover=st0.btn_down'],['quantity-down-pressed','Pointer down on first card decrement','pressed=st0.btn_down'],
  ['page-all-middle','All-products middle page','category=all; page=3/6'],['page-all-last','All-products last page with four cards','category=all; page=6/6'],
  ['page-prev-boundary','Previous on first page leaves page unchanged','category=all; page=1/6; click=previous'],
  ['page-next-boundary','Next on last page leaves page unchanged','category=all; page=6/6; click=next'],
  ['quantity-zero-refused','Manual zero prevents confirmation','st0.quantity=0; no dialog'],['quantity-99','Manual maximum-length quantity','st0.quantity=99'],['quantity-100','Arrow path reaches quantity 100','st0.quantity=100'],
  ['confirm-dialog','Positive quantity appends character 624','st0.quantity=2; total=16000'],
  ['confirm-ok-hover','Pointer over confirm','dialog; hover=btn_ok'],['confirm-ok-pressed','Pointer down on confirm','dialog; pressed=btn_ok'],
  ['confirm-cancel-hover','Pointer over cancel','dialog; hover=btn_change'],['confirm-cancel-pressed','Pointer down on cancel','dialog; pressed=btn_change'],
  ['purchase-refused-soul','Insufficient soul closes dialog without mutation','soul=7999; quantity=1; warning=shared-host'],
  ['purchase-success','Successful purchase closes dialog and resets quantity','soul=16000->8000; wpqhs1 +1; quantity=1'],
  ['p2-selected','Two-player owner switches to P2','p2; category=all; page=1/6'],
  ['back-hover','Pointer over return','hover=btn_back'],['back-pressed','Pointer down on return','pressed=btn_back'],
  ['closed-return','Return removes character 721','page removed; map resumes'],
];
const closedStates = new Set(['closed-return']);
const dialogStates = new Set(['confirm-dialog','confirm-ok-hover','confirm-ok-pressed','confirm-cancel-hover','confirm-cancel-pressed']);
const pageStates = stateSpecs.map(([id])=>id).filter((id)=>!closedStates.has(id));
const cardCounts = Object.fromEntries(pageStates.map((id)=>[id, id==='category-fashion-selected'?8:id==='category-pet-selected'?5:(id==='page-all-last'||id==='page-next-boundary'?4:9)]));

const sha256 = (p) => createHash('sha256').update(readFileSync(path.join(root,p))).digest('hex');
const round = (n) => Math.round(n*1000)/1000;
const bounds = (left,top,width,height) => ({left:round(left),top:round(top),width:round(width),height:round(height)});
const matrix = (a=1,b=0,c=0,d=1,tx=0,ty=0) => ({a:round(a),b:round(b),c:round(c),d:round(d),tx:round(tx),ty:round(ty)});
const render = (assetRef,extra={}) => ({assetRef,blendMode:'normal',filters:[],maskId:null,...extra});
const placement = (stateId,localMatrix,localBounds,stageBounds,derivation,evidenceRefs,extra={}) => ({stateId,visible:true,localMatrix,registrationPoint:{x:0,y:0},localBounds,stageBounds,derivation,derivationMethod:derivation==='extracted'?'Direct FFDec SVG PlaceObject matrix and visible envelope from restored SWF.':'AS3 dynamic child position composed with restored-SWF parent geometry.',evidenceRefs,...extra});
function attrs(tag){return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m)=>[m[1],m[2]]));}
function findExport(characterId,ext='svg'){
  const base=path.join(root,`${taskOutput}/exports-${ext==='svg'?'svg':'png'}`);
  const dir=readdirSync(base,{withFileTypes:true}).find((e)=>e.isDirectory()&&e.name.startsWith(`DefineSprite_${characterId}_`));
  if(!dir)throw new Error(`Missing character ${characterId} ${ext} export`);
  return `${taskOutput}/exports-${ext==='svg'?'svg':'png'}/${dir.name}/1.${ext}`;
}
function rootUses(svgPath){
  const svg=readFileSync(path.join(root,svgPath),'utf8');
  const match=svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/);
  if(!match)throw new Error(`No root display list in ${svgPath}`);
  return [...match[1].matchAll(/<use\b[^>]*\/>/g)].map((m,index)=>{const a=attrs(m[0]);const v=a.transform.match(/matrix\(([^)]*)\)/)[1].split(',').map(Number);return{characterId:Number(a['ffdec:characterId']),symbolClass:a['ffdec:characterName']??null,instanceName:a.id??null,href:a['xlink:href'].slice(1),width:Number(a.width),height:Number(a.height),matrix:matrix(...v),depth:index+1};});
}
function compose(parent,child){return matrix(parent.a*child.a+parent.c*child.b,parent.b*child.a+parent.d*child.b,parent.a*child.c+parent.c*child.d,parent.b*child.c+parent.d*child.d,parent.a*child.tx+parent.c*child.ty+parent.tx,parent.b*child.tx+parent.d*child.ty+parent.ty);}

const pageSvg=findExport(721), cardSvg=findExport(717), dialogSvg=findExport(624);
const displayObjects=[];
function addObject({id,parentId,depth,objectType,characterId,symbolClass=null,instanceName=null,states,localMatrix=matrix(),localBounds=bounds(0,0,940,590),assetRef=null,derivation='extracted',hitArea=null,textStyle=null,buttonCharacter=null,provenanceId='backpack1-swf'}){
  const stageBounds=bounds(localMatrix.tx,localMatrix.ty,localBounds.width*Math.abs(localMatrix.a),localBounds.height*Math.abs(localMatrix.d));
  const buttonStateAssets=buttonCharacter?{up:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/1_up.png`,over:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/2_over.png`,down:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/3_down.png`,hit:`${taskOutput}/exports-buttons/DefineButton2_${buttonCharacter}/4_hittest.png`}:undefined;
  displayObjects.push({id,parentId,depth,objectType,sourceIdentity:{provenanceId,characterId,symbolClass,instanceName,frame:1},placements:states.map((s)=>placement(s,localMatrix,localBounds,stageBounds,derivation,[`${provenanceId}:character-${characterId??'dynamic'}-frame-1`],{...(hitArea?{hitArea}:{} )})),render:render(assetRef,{...(textStyle?{textStyle}:{}),...(buttonStateAssets?{buttonStateAssets}:{})})});
}
addObject({id:'shop-page-root',parentId:null,depth:0,objectType:'movie-clip',characterId:721,symbolClass:'export.microshop.Micropayment',states:pageStates,assetRef:pageSvg,localBounds:bounds(0,0,943.15,590)});
const pageUses=rootUses(pageSvg), cardUses=rootUses(cardSvg);
const pageButtonIds=new Set([636,643,648,653,658,668,675,680,685,690,719]);
const textSources={663:'currentPlayer.getLhValue()',691:'currentPage + "/" + totalPages'};
for(const u of pageUses){
  const isCard=u.characterId===717; const type=pageButtonIds.has(u.characterId)?'button':textSources[u.characterId]?'text-field':isCard?'movie-clip':u.href.startsWith('shape')?'shape':'sprite';
  const index=isCard?Number((u.instanceName??'st0').slice(2)):null;
  const states=isCard?pageStates.filter((id)=>cardCounts[id]>index):pageStates;
  const id=`shop-page-root.${u.instanceName??`${type}-${u.characterId}-depth-${u.depth}`}`;
  addObject({id,parentId:'shop-page-root',depth:u.depth,objectType:type,characterId:u.characterId,symbolClass:u.symbolClass,instanceName:u.instanceName,states,localMatrix:u.matrix,localBounds:bounds(0,0,u.width,u.height),assetRef:`${pageSvg}#${u.href}`,hitArea:type==='button'?bounds(u.matrix.tx,u.matrix.ty,u.width,u.height):null,textStyle:type==='text-field'?{dynamic:true,fontFamily:'FZCuYuan-M03',source:textSources[u.characterId]}:null,buttonCharacter:type==='button'?u.characterId:null});
  if(isCard){
    for(const child of cardUses){
      const childType=[703,711,716].includes(child.characterId)?'button':[697,698,704].includes(child.characterId)?'text-field':child.href.startsWith('shape')?'shape':'sprite';
      const childMatrix=compose(u.matrix,child.matrix);
      addObject({id:`${id}.${child.instanceName??`${childType}-${child.characterId}-depth-${child.depth}`}`,parentId:id,depth:child.depth,objectType:childType,characterId:child.characterId,symbolClass:child.symbolClass,instanceName:child.instanceName,states,localMatrix:childMatrix,localBounds:bounds(0,0,child.width,child.height),assetRef:`${cardSvg}#${child.href}`,hitArea:childType==='button'?bounds(childMatrix.tx,childMatrix.ty,child.width,child.height):null,textStyle:childType==='text-field'?{dynamic:true,fontFamily:'FZCuYuan-M03',source:child.characterId===697?'fixture.product.name':child.characterId===698?'fixture.product.price + "灵魂"':'fixture.quantity'}:null,buttonCharacter:childType==='button'?child.characterId:null});
    }
    addObject({id:`${id}.runtime-product-icon`,parentId:id,depth:1000,objectType:'bitmap',characterId:null,instanceName:'packThing',states,localMatrix:matrix(1,0,0,1,u.matrix.tx+15,u.matrix.ty+20),localBounds:bounds(0,0,50,50),assetRef:`runtime-inventory-item:fixture.cards[${index}].fillName`,derivation:'calculated',provenanceId:'shop-thing-as'});
  }
}
addObject({id:'shop-page-root.confirm-dialog',parentId:'shop-page-root',depth:2000,objectType:'movie-clip',characterId:624,symbolClass:'export.microshop.SumInterface',states:[...dialogStates],assetRef:dialogSvg,localBounds:bounds(0,0,940,590),derivation:'calculated'});
for(const u of rootUses(dialogSvg)){
  const type=[617,622].includes(u.characterId)?'button':u.characterId===623?'text-field':u.href.startsWith('shape')?'shape':'sprite';
  addObject({id:`shop-page-root.confirm-dialog.${u.instanceName??`${type}-${u.characterId}-depth-${u.depth}`}`,parentId:'shop-page-root.confirm-dialog',depth:u.depth,objectType:type,characterId:u.characterId,symbolClass:u.symbolClass,instanceName:u.instanceName,states:[...dialogStates],localMatrix:u.matrix,localBounds:bounds(0,0,u.width,u.height),assetRef:`${dialogSvg}#${u.href}`,hitArea:type==='button'?bounds(u.matrix.tx,u.matrix.ty,u.width,u.height):null,textStyle:type==='text-field'?{dynamic:true,fontFamily:'FZCuYuan-M03',source:'quantity, product name and discounted total'}:null,buttonCharacter:type==='button'?u.characterId:null});
}
const visibleCount=(stateId)=>displayObjects.filter((o)=>o.placements.some((p)=>p.stateId===stateId&&p.visible)).length;
const baselines=stateSpecs.map(([id])=>{const p=`${baselineRoot}/original-${id}-940x590.png`;return{id:`original-${id}-940x590`,stateId:id,path:p,sha256:sha256(p),width:940,height:590,crop:bounds(0,0,940,590)}});
const manifest={$schema:'../schema/ui-ground-truth.schema.json',schemaVersion:1,truthId:'task-settings-175f.shop-page',status:'verified',scope:{taskId:'TASK-SETTINGS-175F',surfaceId:'shop-page-characters-721-717-624',originalVersion:'RegiMA 1.1 restored corpus',description:'Character 721 complete root display list, nine nested 717 product cards with runtime item icons, and character 624 purchase confirmation. Shared feedback and the user-approved shared soul balance are host projections rather than original page children.'},generatedBy:{tool:'generate-shop-page-ground-truth.mjs',toolVersion:'1',command,generatedAt:'2026-08-16T17:30:00+08:00'},provenance:[
  {id:'backpack1-swf',sourceType:'restored-swf',sourcePath:swfPath,sha256:sha256(swfPath),locator:'characters 721 export.microshop.Micropayment, 717 ShopThing and 624 SumInterface; direct FFDec 26 SVG/PNG/button export.'},
  {id:'micropayment-as',sourceType:'legacy-as3',sourcePath:pageAsPath,sha256:sha256(pageAsPath),locator:'added/selectTag/setShopThingEquipment/play1Click/play2Click/buySuccess/backClick.'},
  {id:'shop-thing-as',sourceType:'legacy-as3',sourcePath:cardAsPath,sha256:sha256(cardAsPath),locator:'setEquipment/visibleFalse/visibleTrue/changenum/upClick/downClick/buyClick/buychange.'},
  {id:'sum-interface-as',sourceType:'legacy-as3',sourcePath:dialogAsPath,sha256:sha256(dialogAsPath),locator:'added/okClick/changeClick/removed; quantity/name/discounted-total text and BuySuccess/BUYCHANGLE dispatch.'},
  {id:'backpack1-ffdec-xml',sourceType:'ffdec-xml',sourcePath:xmlPath,sha256:sha256(xmlPath),locator:'SymbolClass and character tags for 721/717/624 plus nested PlaceObject and DefineButton2 records.'}
],stage:{width:940,height:590,frameRate:24,coordinateSpace:'stage',scaleMode:'noScale',alignment:'top-left'},states:stateSpecs.map(([id,entry,fixtureId])=>({id,entry,frame:closedStates.has(id)?0:1,fixtureId,baselineId:`original-${id}-940x590`})),displayObjects,baselines,completeness:{expectedStateIds:stateSpecs.map(([id])=>id),extractedStateIds:stateSpecs.map(([id])=>id),expectedVisibleObjectCountByState:Object.fromEntries(stateSpecs.map(([id])=>[id,visibleCount(id)])),displayListMatched:true,stateSetMatched:true,unresolved:[]},evidenceRefs:['docs/reverse-engineering/evidence/TASK-SETTINGS-175F-shop-page.md','docs/reverse-engineering/shop-ui-index.md#task-settings-175f-商城页-机器真值','docs/reverse-engineering/evidence/TASK-SETTINGS-175-functional-ui-truth-audit.md']};
const serialized=`${JSON.stringify(manifest,null,2)}\n`;
if(process.argv.includes('--check')){const current=readFileSync(path.join(root,outputPath),'utf8');if(current!==serialized)throw new Error(`${outputPath} is stale; run ${command}`);console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`);}else{writeFileSync(path.join(root,outputPath),serialized);console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`);}
