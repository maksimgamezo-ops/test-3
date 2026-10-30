// Uses Chromium's own screencast and the installed ffmpeg; no Playwright CDN binary.
import {chromium,expect} from '@playwright/test';
import {existsSync} from 'node:fs';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1280,height:1000}});const page=await context.newPage();
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:3001',{waitUntil:'networkidle'});
 await page.locator('#creation').scrollIntoViewIfNeeded();
 const directory=await mkdtemp('/tmp/bauplan-frames-'),frames=[],pending=[];
 const session=await context.newCDPSession(page);
 session.on('Page.screencastFrame',event=>{
  const file=path.join(directory,`${String(frames.length).padStart(5,'0')}.jpg`);
  frames.push({file,time:event.metadata.timestamp});
  pending.push(writeFile(file,Buffer.from(event.data,'base64')));
  session.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});
 });
 await session.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:1280,maxHeight:1000,everyNthFrame:1});
 await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
 await expect(page.locator('.sequence')).toHaveAttribute('data-ready','true',{timeout:30000});
 const slider=page.getByRole('slider',{name:'Ход анимации'});
 await expect.poll(async()=>Number(await slider.inputValue()),{timeout:30000}).toBe(15);
 await page.screenshot({path:'docs/previews/sequence-final.png'});
 await session.send('Page.stopScreencast');await Promise.all(pending);
 if(frames.length<2)throw new Error('No useful screencast frames captured');
 const list=frames.map((frame,i)=>`file '${frame.file}'\nduration ${i<frames.length-1?Math.max(.016,frames[i+1].time-frame.time):.5}`).join('\n');
 await writeFile(path.join(directory,'frames.txt'),list+'\n');
 execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',path.join(directory,'frames.txt'),'-an','-c:v','libvpx-vp9','-crf','32','-b:v','0','docs/previews/sequence.webm']);
 console.log(`Recorded ${frames.length} actual browser frames through 15 seconds of playback.`);
}finally{await browser.close();}
