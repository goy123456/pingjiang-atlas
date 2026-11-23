'use strict';
const {chromium}=require('playwright-core');
const fs=require('node:fs'), assert=require('node:assert/strict');
const url='https://goy123456.github.io/pingjiang-atlas/index.html?v=9b3bcf6#map';
const dir='map-evidence';fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true});
 const page=await b.newPage({viewport:{width:1440,height:900}, deviceScaleFactor:1});
 const report={url,time:new Date().toISOString(),browser:b.version(),samples:{},checks:[]};
 const snap=async k=>page.screenshot({path:dir+'/'+k+'.png',timeout:10000});
 try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response.status(),200);
  const map=page.frameLocator('iframe[title="平江交互地图"]'),v=map.locator('#viewport');
  await map.locator('#viewport[data-min-zoom]').waitFor({timeout:45000});
  await map.locator('#markers button').first().waitFor({state:'attached'});
  const state=async()=>({...await v.evaluate(e=>{
   const d=e.ownerDocument,s=d.querySelector('#stage'),scale=d.querySelector('#scale');
   const box=e.getBoundingClientRect(),sheet=s.getBoundingClientRect();
   return {pct:parseInt(scale.textContent),zoom:Number(e.dataset.zoom),x:e.scrollLeft,y:e.scrollTop,
    w:e.clientWidth,h:e.clientHeight,sw:s.offsetWidth,sh:s.offsetHeight,
    contained:sheet.left>=box.left-2&&sheet.top>=box.top-2&&sheet.right<=box.right+2&&sheet.bottom<=box.bottom+2,
    minusDisabled:d.querySelector('#minus').disabled,pins:d.querySelectorAll('#markers button').length};
  }),pageY:await page.evaluate(()=>window.scrollY)});
  const record=async name=>{const s=await state();report.samples[name]=s;console.log(name,JSON.stringify(s));await snap(name);return s;};
  const waitFor=async(check,label)=>{for(let i=0;i<60;i++){const s=await state();if(check(s))return s;await new Promise(r=>setTimeout(r,50));}throw Error('Timed out: '+label);};
  const start=await record('01-start');assert.equal(start.pct,100);
  const box=await v.boundingBox();assert(box);
  let p={x:box.x+box.width*.45,y:box.y+box.height*.49};
  await page.mouse.move(p.x,p.y);
  for(let i=0;i<20;i++){const s=await state();if(s.minusDisabled)break;await page.mouse.wheel(0,170);await waitFor(a=>a.zoom<s.zoom,'wheel out');}
  const min=await record('02-minimum');assert(min.pct<100&&min.minusDisabled&&min.contained);assert.equal(min.pageY,start.pageY);
  report.checks.push('wheel out: full sheet fits at minimum'); 
  for(let i=0;i<20;i++){const s=await state();if(s.pct>=145)break;await page.mouse.wheel(0,-170);await waitFor(a=>a.zoom>s.zoom,'wheel in');}
  const before=await record('03-enlarged');assert(before.pct>=145);assert.equal(before.pageY,start.pageY);report.checks.push('wheel in');
  const offset=await v.evaluate(el=>{const d=el.ownerDocument,box=el.getBoundingClientRect();for(const fx of [.42,.52,.6,.34])for(const fy of [.46,.54,.63]){const x=box.x+box.width*fx,y=box.y+box.height*fy;const t=d.elementFromPoint(x,y);if(t&&el.contains(t)&&!t.closest('button,a'))return {dx:x-box.x,dy:y-box.y};}});
  assert(offset);p={x:box.x+offset.dx,y:box.y+offset.dy};
  // Twelve whole-pixel moves avoid cumulative rounding of 80 / 12 fractional scroll deltas.
  const dx=before.x>110?96:-96,dy=before.y>100?84:-84;
  await v.evaluate(el=>{const part=e=>({x:e.clientX,y:e.clientY});el.addEventListener('pointerdown',e=>{el.dataset.qaDown=JSON.stringify(part(e))},{once:true});el.addEventListener('pointerup',e=>{el.dataset.qaUp=JSON.stringify(part(e))},{once:true});});
  await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+dx,p.y+dy,{steps:12});await page.mouse.up();
  await waitFor(s=>Math.abs(s.x-before.x)+Math.abs(s.y-before.y)>30,'map drag');
  const after=await record('04-dragged');
  report.pointer=await v.evaluate(el=>({down:JSON.parse(el.dataset.qaDown),up:JSON.parse(el.dataset.qaUp)}));
  assert(Math.abs(report.pointer.up.x-report.pointer.down.x-dx)<=1&&Math.abs(report.pointer.up.y-report.pointer.down.y-dy)<=1);
  assert(Math.abs((after.x-before.x)+dx)<=3&&Math.abs((after.y-before.y)+dy)<=3);assert.equal(after.pct,before.pct);assert.equal(after.pageY,start.pageY);report.checks.push('drag follows pointer on both axes without page scroll');
  await map.locator('#reset').click();await waitFor(s=>s.pct===start.pct&&Math.abs(s.x-start.x)<=2&&Math.abs(s.y-start.y)<=2,'overview reset');
  const reset=await record('05-reset');assert.equal(reset.pageY,start.pageY);report.checks.push('reset restores initial scale and position');
  report.result='PASS';
 } catch(e){report.result='FAIL';report.error=String(e);await snap('failure').catch(()=>{});process.exitCode=1;}
 finally{fs.writeFileSync(dir+'/result.json',JSON.stringify(report,null,2));console.log('RESULT',JSON.stringify(report));if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'### Public map: '+report.result+'\n\n```json\n'+JSON.stringify(report,null,2)+'\n```\n');await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
