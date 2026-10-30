'use client';
import {useEffect} from 'react';import {usePathname} from 'next/navigation';
export default function MotionDirector(){
 const path=usePathname();
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const nodes=Array.from(document.querySelectorAll<HTMLElement>('.section-heading,.detail-heading,.company-editorial,.editorial-rows article,.process-list li,.home-stages li,.contact-invitation>div'));
  let observer:IntersectionObserver|undefined;
  const showAll=()=>{observer?.disconnect();nodes.forEach(node=>node.classList.remove('reveal-target','is-revealed'));};
  const setup=()=>{
   showAll();if(media.matches)return;
   observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer?.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
   nodes.forEach(node=>{if(node.getBoundingClientRect().top>innerHeight){node.classList.add('reveal-target');observer!.observe(node);}});
  };
  const focus=(event:FocusEvent)=>{const target=event.target as HTMLElement;target.closest('.reveal-target')?.classList.add('is-revealed');};
  setup();media.addEventListener('change',setup);document.addEventListener('focusin',focus);
  return()=>{showAll();media.removeEventListener('change',setup);document.removeEventListener('focusin',focus);};
 },[path]);return null;
}
