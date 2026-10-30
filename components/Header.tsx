'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect,useRef,useState } from 'react';
import { company,navigation } from '@/content/company';
export default function Header(){
 const [open,setOpen]=useState(false),button=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null),pathname=usePathname();
 const desktop=useRef<HTMLElement>(null);
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{
  const media=window.matchMedia('(min-width: 851px)');
  const closeOnDesktop=()=>{
   if(!media.matches)return;
   const restoreFocus=document.activeElement===button.current||menu.current?.contains(document.activeElement);
   setOpen(false);
   if(restoreFocus)desktop.current?.querySelector('a')?.focus();
  };
  closeOnDesktop();media.addEventListener('change',closeOnDesktop);
  return()=>media.removeEventListener('change',closeOnDesktop);
 },[]);
 useEffect(()=>{
  if(!open)return;
  const prior=document.body.style.overflow;document.body.style.overflow='hidden';
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){setOpen(false);button.current?.focus();}
   if(e.key==='Tab'){
    const links=Array.from(menu.current?.querySelectorAll<HTMLAnchorElement>('a')??[]);const first=button.current,last=links.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };document.addEventListener('keydown',key);return()=>{document.body.style.overflow=prior;document.removeEventListener('keydown',key);};
 },[open]);
 return <header className="site-header"><Link className="wordmark" href="/" aria-label="BAUPLANINVEST — главная"><span className="brand-symbol" aria-hidden="true"><i/><i/><i/></span>{company.brand}</Link>
  <nav ref={desktop} className="desktop-nav" aria-label="Основная навигация">{navigation.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}>{label}</Link>)}</nav>
  <Link className="header-contact" href="/contacts">Связаться <span aria-hidden="true">↗</span></Link>
  <button ref={button} className="menu-button" aria-label="Меню" aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)}>{open?'Закрыть':'Меню'}<span aria-hidden="true">{open?'−':'+'}</span></button>
  <div ref={menu} id="mobile-navigation" className="mobile-menu" hidden={!open}>
   <nav aria-label="Мобильная навигация">{navigation.map(([href,label],i)=><Link key={href} href={href} onClick={()=>setOpen(false)}><small>0{i+1}</small>{label}<span aria-hidden="true">↗</span></Link>)}</nav>
   <div className="mobile-contacts"><a href={company.phones[0].href}>{company.phones[0].label}</a><a href={`mailto:${company.email}`}>Написать письмо ↗</a></div>
  </div>
 </header>;
}
