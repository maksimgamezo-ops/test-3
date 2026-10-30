'use client';
import {useEffect,useRef,useState} from 'react';
const chapters=[['hero','Первое впечатление'],['creation','Рождение архитектуры'],['details','Детали'],['approach','Подход'],['company','Компания']] as const;
export default function ChapterNavigation(){
 const [active,setActive]=useState('hero');const progress=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   const max=document.documentElement.scrollHeight-innerHeight;
   if(progress.current)progress.current.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;
   let current='hero';
   for(const [id] of chapters){const section=document.getElementById(id);if(section&&section.getBoundingClientRect().top<innerHeight*.45)current=id;}
   setActive(current);frame=0;
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};update();
  addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);
  return()=>{removeEventListener('scroll',scroll);removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
 },[]);
 return <><div className="reading-progress" aria-hidden="true"><div ref={progress}/></div><nav className="chapter-navigation" aria-label="Главы главной страницы">{chapters.map(([id,title],index)=><a key={id} href={`#${id}`} aria-label={`0${index+1} — ${title}`} aria-current={active===id?'location':undefined}><span className="chapter-nav-label">{title}</span><span className="chapter-nav-number">0{index+1}</span></a>)}</nav></>;
}
