import {readFile,readdir} from 'node:fs/promises';import path from 'node:path';
export async function collectLibraryLicenses(metafile){
 const inputs=new Set(Object.values(metafile.outputs).flatMap(output=>Object.entries(output.inputs).filter(([,value])=>value.bytesInOutput>0).map(([name])=>name)));
 const roots=new Set();
 for(const input of inputs){
  if(!input.includes('node_modules/'))continue;
  let directory=path.dirname(path.resolve(input));
  while(directory!==path.dirname(directory)){
   try{const pkg=JSON.parse(await readFile(path.join(directory,'package.json'),'utf8'));if(pkg.name&&pkg.version){roots.add(directory);break;}}catch{}
   directory=path.dirname(directory);
  }
 }
 const libraries=[],missing=[];
 for(const root of [...roots].sort()){
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  const files=(await readdir(root,{withFileTypes:true})).filter(entry=>entry.isFile()&&/^(licen[sc]e|copying|notice)(\.|$|-)/i.test(entry.name));
  const texts=await Promise.all(files.map(file=>readFile(path.join(root,file.name),'utf8')));
  if(!texts.length){
   try{texts.push(await readFile(path.join('docs/licenses',pkg.name.replaceAll('/','--')+'-LICENSE'),'utf8'));}catch{missing.push(`${pkg.name}@${pkg.version}`);}
  }
  libraries.push({name:pkg.name,version:pkg.version,license:pkg.license??'See notices',text:texts.join('\n\n')});
 }
 return {libraries,missing};
}
