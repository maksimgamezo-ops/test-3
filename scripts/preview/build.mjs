import {build} from 'esbuild';
import {collectLibraryLicenses} from './licenses.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';import path from 'node:path';
const root=process.cwd(),assets={};
const mime={'.webp':'image/webp','.glb':'model/gltf-binary','.woff':'font/woff','.ttf':'font/ttf'};
for(const name of ['images/architecture-desktop.webp','images/architecture-mobile.webp','models/architecture.glb','fonts/NotoSans-Regular.ttf','fonts/NotoSans-Bold.ttf','fonts/symbols.woff']){
 const content=await readFile(path.join(root,'public',name));
 assets[`/${name}`]=`data:${mime[path.extname(name)]};base64,${content.toString('base64')}`;
}
const bundled=await build({entryPoints:['scripts/preview/entry.tsx'],bundle:true,write:false,metafile:true,minify:true,format:'iife',platform:'browser',target:['chrome110','firefox115','safari16'],jsx:'automatic',alias:{'next/link':path.join(root,'scripts/preview/link.tsx'),'next/navigation':path.join(root,'scripts/preview/navigation.ts'),'next/dynamic':path.join(root,'scripts/preview/dynamic.tsx')},define:{'process.env.NODE_ENV':'"production"','process.env.SITE_URL':'undefined'},legalComments:'inline'});
let css=await readFile('app/globals.css','utf8');
css=css.replace("url('/fonts/symbols.woff')",`url('${assets['/fonts/symbols.woff']}')`);
css+=`\n@font-face{font-family:BauplanOffline;src:url('${assets['/fonts/NotoSans-Regular.ttf']}') format('truetype');font-weight:400;font-display:swap}@font-face{font-family:BauplanOffline;src:url('${assets['/fonts/NotoSans-Bold.ttf']}') format('truetype');font-weight:700;font-display:swap}:root{--font-sans:BauplanOffline}`;
const script=bundled.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const icon=await readFile('app/icon.svg','utf8');
const licenses=await Promise.all(['public/fonts/LICENSE.txt','public/fonts/LICENSE-symbols.txt'].map(name=>readFile(name,'utf8')));
const notices=await collectLibraryLicenses(bundled.metafile);
if(notices.missing.length)throw new Error('Missing full licenses: '+notices.missing.join(', '));
const licenseJson=JSON.stringify({fonts:licenses,...notices}).replace(/</g,'\\u003c');
const html=`<!doctype html><html lang="ru-BY"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>BAUPLANINVEST — пространства для развития бизнеса</title><link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon)}"><style>${css}</style></head><body><div id="app"></div><script type="application/json" id="asset-licenses">${licenseJson}</script><noscript>Для интерактивного просмотра этого файла включите JavaScript. Основной серверный сайт поддерживает чтение без JavaScript.</noscript><script>window.__BAUPLAN_ASSETS__=${JSON.stringify(assets)};</script><script>${script}</script></body></html>`;
await mkdir('deliverables',{recursive:true});await writeFile('deliverables/BAUPLANINVEST.html',html);
console.log(`Self-contained site: ${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MB. No external runtime assets.`);
