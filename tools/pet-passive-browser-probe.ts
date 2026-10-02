import { drawPetPassiveFrame, petPassiveClip, petPassiveImages } from './pet-passive-assets/candidate';

declare global { interface Window { result: unknown; representative: string } }
const load = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url;
});
async function run() {
  const images = new Map<string, CanvasImageSource>();
  for (const asset of petPassiveImages) images.set(asset.key.split(':')[1]!, await load(asset.path));
  const canvas = document.createElement('canvas'); canvas.width = 940; canvas.height = 590; document.body.append(canvas);
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  const results = [];
  const cache = new Map<string, HTMLImageElement>();
  for (const test of await (await fetch('/inputs.json')).json()) {
    context.clearRect(0, 0, 940, 590);
    drawPetPassiveFrame(context, images, petPassiveClip(test.effect, test.profile, test.direction), test.frame, test.x, test.y, test.sign, test.alpha);
    const actual = context.getImageData(test.crop.left, test.crop.top, test.crop.width, test.crop.height).data;
    const expectedCanvas = document.createElement('canvas'); expectedCanvas.width = test.crop.width; expectedCanvas.height = test.crop.height;
    const expectedContext = expectedCanvas.getContext('2d')!; if(!cache.has(test.expected)) cache.set(test.expected, await load(test.expected)); expectedContext.drawImage(cache.get(test.expected)!, 0, 0);
    const expected = expectedContext.getImageData(0, 0, test.crop.width, test.crop.height).data;
    let pixelsOver3 = 0, maxDelta = 0, outsideEnvelope = 0; const residuals: unknown[] = [];
    for (let i = 0; i < actual.length; i += 4) {
      let delta = 0;
      for (let c = 0; c < 4; c++) delta = Math.max(delta, Math.abs(c === 3 ? actual[i + c]! - expected[i + c]!
        : actual[i + c]! * actual[i + 3]! / 255 - expected[i + c]! * expected[i + 3]! / 255));
      maxDelta = Math.max(maxDelta, delta); if (delta > 3) {
        pixelsOver3++;
        const px=i/4%test.crop.width, py=Math.floor(i/4/test.crop.width);
        let outside=false;
        for(let c=0;c<4;c++) {
          let low=255, high=0;
          for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
            const nx=px+dx,ny=py+dy;
            const v=nx<0||ny<0||nx>=test.crop.width||ny>=test.crop.height?0:
              c===3?expected[(ny*test.crop.width+nx)*4+3]!:
              expected[(ny*test.crop.width+nx)*4+c]!*expected[(ny*test.crop.width+nx)*4+3]!/255;
            low=Math.min(low,v);high=Math.max(high,v);
          }
          const v=c===3?actual[i+3]!:actual[i+c]!*actual[i+3]!/255;
          if(v<low-3||v>high+3)outside=true;
        }
        if(outside)outsideEnvelope++;
        if(residuals.length < 6) residuals.push({x: i/4%test.crop.width +test.crop.left,y: Math.floor(i/4/test.crop.width)+test.crop.top,actual:[...actual.slice(i,i+4)],expected:[...expected.slice(i,i+4)]});
      }
    }
    if(results.length%100===0) await new Promise(resolve=>setTimeout(resolve,0));
    results.push({ id: test.id, pixelsOver3, maxDelta, outsideEnvelope, residuals });
  }
  window.representative = canvas.toDataURL();
  window.result = { status: 'diagnostic', results };
}
run().catch(error => { window.result = { status: 'failed', error: String(error) }; });
