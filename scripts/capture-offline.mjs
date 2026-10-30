import {chromium} from '@playwright/test';import {readFile} from 'node:fs/promises';import {existsSync} from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},offline:true});const page=await context.newPage();
 const html=await readFile('deliverables/BAUPLANINVEST.html','utf8');
 async function capture(prefix,width,height){
  await page.setViewportSize({width,height});await page.setContent(html);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1100);
  await page.screenshot({path:`docs/previews/${prefix}.png`});
  const total=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<total;y+=height*.7){await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),y);await page.waitForTimeout(100);}
  await page.waitForTimeout(850);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
  await page.screenshot({path:`docs/previews/${prefix==='desktop'?'home':prefix}-full.png`,fullPage:true});
 }
 await capture('desktop',1440,1000);await capture('mobile',390,844);
}finally{await browser.close();}
