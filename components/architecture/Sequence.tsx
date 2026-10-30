'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
const Scene=dynamic(()=>import('./Scene'),{ssr:false});
class SceneBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onError();}
 render(){return this.state.failed?null:this.props.children;}
}
export default function Sequence({modelUrl='/models/architecture.glb',posterUrl='/images/architecture-desktop.webp'}:{modelUrl?:string;posterUrl?:string}){
 const [seconds,setSeconds]=useState(15),[playing,setPlaying]=useState(false),[active,setActive]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[reduced,setReduced]=useState(false),[inView,setInView]=useState(false),[resetKey,setResetKey]=useState(0),[detail,setDetail]=useState(0);
 const container=useRef<HTMLDivElement>(null);
 const onReady=useCallback(()=>setReady(true),[]),onError=useCallback(()=>{setFailed(true);setPlaying(false);},[]);
 useEffect(()=>{const mq=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(mq.matches);if(mq.matches){setPlaying(false);setActive(false);setSeconds(15);}};update();mq.addEventListener('change',update);return()=>mq.removeEventListener('change',update);},[]);
 useEffect(()=>{if(!active||ready||failed)return;const timer=window.setTimeout(onError,25000);return()=>clearTimeout(timer);},[active,ready,failed,onError]);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>{setInView(entry.isIntersecting);if(!entry.isIntersecting)setPlaying(false);},{threshold:.15});
  if(container.current)observer.observe(container.current);
  const hide=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',hide);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);};
 },[]);
 useEffect(()=>{
  if(!playing||!ready||failed||reduced)return;
  let id=0,last=performance.now();
  const frame=(now:number)=>{const delta=Math.max(0,(now-last)/1000);last=now;setSeconds(t=>{const next=Math.min(15,t+delta);return next;});id=requestAnimationFrame(frame);};
  id=requestAnimationFrame(frame);return()=>cancelAnimationFrame(id);
 },[playing,ready,failed,reduced]);
 useEffect(()=>{if(seconds>=15)setPlaying(false);},[seconds]);
 const play=()=>{if(reduced||failed)return;setActive(true);setDetail(0);if(seconds>=15)setSeconds(0);setPlaying(true);};
 const stage=seconds<3?'Участок':seconds<6?'Объём':seconds<10?'Фасад':seconds<13?'Свет и окружение':'Архитектура';
 return <div className="sequence" ref={container} data-ready={ready} data-active={active}>
  <div className="sequence-viewport">
   {/* The authored poster remains behind the canvas throughout loading and errors. */}
   <picture><source media="(max-width: 600px)" srcSet="/images/architecture-mobile.webp"/><img src={posterUrl} alt="Авторская концептуальная визуализация: стеклянный коммерческий павильон с каменными поясами и вечерним освещением" loading="lazy" width="1920" height="1200"/></picture>
   {active&&inView&&!failed&&!reduced&&<div className={`canvas-layer ${ready?'is-ready':''}`}><SceneBoundary onError={onError}><Scene seconds={seconds} resetKey={resetKey} onReady={onReady} onError={onError} modelUrl={modelUrl} detail={detail}/></SceneBoundary></div>}
   <div className="scene-topline"><span>КОНЦЕПТ / 01</span><span>{active&&ready&&!failed?'ИНТЕРАКТИВНАЯ СЦЕНА':'АРХИТЕКТУРНОЕ ИССЛЕДОВАНИЕ'}</span></div>
   <div className="scene-bottomline"><span>{stage}</span><span aria-hidden="true">{String(Math.floor(seconds)).padStart(2,'0')} / 15 СЕК</span></div>
  </div>
  <div className="sequence-controls">
   <div className="playback-buttons">
    <button className="button button-light" onClick={playing?()=>setPlaying(false):play} disabled={reduced||failed}>{playing?'Пауза':seconds>=15?'Воспроизвести':'Продолжить'}<span aria-hidden="true">{playing?'Ⅱ':'▷'}</span></button>
    <button className="text-button" onClick={()=>{setSeconds(0);setPlaying(false);setDetail(0);setActive(true);}} disabled={reduced||failed}>Сначала</button>
    <button className="text-button" onClick={()=>{setSeconds(15);setPlaying(false);}}>Пропустить</button>
   </div>
   <label className="scrubber">Ход анимации<input aria-label="Ход анимации" type="range" min="0" max="15" step="0.05" value={seconds} disabled={reduced||failed} onChange={e=>{setSeconds(Number(e.target.value));setPlaying(false);setActive(true);setDetail(0);}}/><output aria-live="off">{seconds.toFixed(1)} с</output></label>
  </div>
  <p className="scene-status" role="status" aria-label="Состояние архитектурной сцены">{reduced?'Анимация отключена в соответствии с настройками устройства. Доступен статичный рендер.':failed?'Интерактивная сцена недоступна. Показан авторский рендер; вся информация сайта доступна.':active&&!ready?'Загружаем архитектурную модель…':ready&&seconds>=15?'Потяните сцену, чтобы рассмотреть здание. Масштаб фиксирован.':'15 секунд: от свободного участка до архитектурной концепции. Запуск — по вашему желанию.'}</p>
  <section className="architecture-detail" id="details" aria-labelledby="details-title"><div className="detail-heading"><p className="eyebrow">03 / АРХИТЕКТУРА В ДЕТАЛЯХ</p><h2 id="details-title">Целое складывается<br/><span>из продуманных решений.</span></h2><p>Выберите ракурс, чтобы исследовать демонстрационную концепцию. Описание относится к визуализации и не определяет характеристики реального проекта.</p></div><div className="detail-selectors" aria-label="Детали концепции">
   {[['Общий вид','Композиция здания и связь с окружающим пространством.'],['Организация пространства','Открытая планировка в концепции допускает разные сценарии использования.'],['Фасад и свет','Ритм стоек, глубина каменных поясов и мягкий вечерний свет.']].map(([title,text],i)=><button key={title} aria-pressed={detail===i} onClick={()=>{setDetail(i);setSeconds(15);setPlaying(false);if(!reduced&&!failed)setActive(true);}}><span className="detail-number">0{i+1}</span><span><strong>{title}</strong><span className="detail-copy">{text}</span></span><span aria-hidden="true">↗</span></button>)}
  </div>
  {active&&!failed&&!reduced&&<button className="text-button reset-view" onClick={()=>{setResetKey(v=>v+1);setDetail(0);setSeconds(15);setPlaying(false);}}>Сбросить вид ↺</button>}</section>
 </div>;
}
