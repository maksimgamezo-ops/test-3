import {createRoot} from 'react-dom/client';import {useEffect,useLayoutEffect} from 'react';
import {DefaultLoadingManager} from 'three';
import SiteFrame from '@/components/SiteFrame';
import Home from '@/app/page';import About from '@/app/about/page';import Directions from '@/app/directions/page';import Approach from '@/app/approach/page';import Projects from '@/app/projects/page';import Contacts from '@/app/contacts/page';import Privacy from '@/app/privacy/page';import NotFound from '@/app/not-found';
import {usePathname} from './navigation';
import {assetUrl} from '@/lib/assets';
DefaultLoadingManager.setURLModifier(assetUrl);
const pages={'/':Home,'/about':About,'/directions':Directions,'/approach':Approach,'/projects':Projects,'/contacts':Contacts,'/privacy':Privacy};
function Preview(){
 const pathname=usePathname();
 const Page=pages[pathname as keyof typeof pages]??NotFound;
 const scrollToAnchor=()=>{
  const anchor=window.location.hash.split('::')[1];
  if(anchor)document.getElementById(decodeURIComponent(anchor))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  else window.scrollTo({top:0,behavior:'instant'});
 };
 useLayoutEffect(()=>{scrollToAnchor();document.title=pathname==='/'?'BAUPLANINVEST — пространства для развития бизнеса':'BAUPLANINVEST';},[pathname]);
 useEffect(()=>{
  const hash=()=>{if(window.location.hash.slice(1).split('::')[0]===pathname)scrollToAnchor();};
  const click=(event:MouseEvent)=>{
   const link=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
   const href=link?.getAttribute('href');if(!href||href.startsWith('#/')||event.defaultPrevented)return;
   event.preventDefault();window.location.hash=`${pathname}::${href.slice(1)}`;scrollToAnchor();
  };
  document.addEventListener('click',click);window.addEventListener('hashchange',hash);
  return()=>{document.removeEventListener('click',click);window.removeEventListener('hashchange',hash);};
 },[pathname]);
 return <SiteFrame><Page/></SiteFrame>;
}
createRoot(document.getElementById('app')!).render(<Preview/>);
