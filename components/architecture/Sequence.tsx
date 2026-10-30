'use client';
import {assetUrl} from '@/lib/assets';
import dynamic from 'next/dynamic';
import {Component,useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import type {CameraAction,CameraCommand} from '@/lib/camera';
const Scene=dynamic(()=>import('./Scene'),{ssr:false});
const views=[
 {title:'Общий вид',text:'Композиция здания и связь с окружающим пространством.'},
 {title:'Организация пространства',text:'Открытая планировка в концепции допускает разные сценарии использования.'},
 {title:'Фасад и свет',text:'Ритм стоек, глубина каменных поясов и мягкий вечерний свет.'},
];
const phases=[{title:'Участок',time:0},{title:'Объём',time:5},{title:'Фасад',time:8},{title:'Свет',time:11.5},{title:'Итог',time:15}];
class SceneBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onError();}
 render(){return this.state.failed?null:this.props.children;}
}
export default function Sequence({modelUrl='/models/architecture.glb',posterUrl='/images/architecture-desktop.webp'}:{modelUrl?:string;posterUrl?:string}){
 const [seconds,setSeconds]=useState(15),[playing,setPlaying]=useState(false),[active,setActive]=useState(false);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[reduced,setReduced]=useState(false);
 const [inView,setInView]=useState(false),[detail,setDetail]=useState(0),[attempt,setAttempt]=useState(0),[retrying,setRetrying]=useState(false);
 const [command,setCommand]=useState<CameraCommand>({id:0,action:'reset'}),[cameraNote,setCameraNote]=useState('Исходный вид');
 const workspace=useRef<HTMLDivElement>(null),viewport=useRef<HTMLDivElement>(null);
 const onReady=useCallback(()=>setReady(true),[]);
 const onError=useCallback(()=>{setFailed(true);setPlaying(false);setReady(false);},[]);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{setReduced(media.matches);if(media.matches){setPlaying(false);setActive(false);setSeconds(15);}};
  update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  if(!active||!inView||ready||failed)return;
  const timer=window.setTimeout(onError,25000);return()=>clearTimeout(timer);
 },[active,inView,ready,failed,onError]);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>{setInView(entry.isIntersecting);if(!entry.isIntersecting){setPlaying(false);setReady(false);}},{threshold:.15});
  if(workspace.current)observer.observe(workspace.current);
  const hide=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',hide);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);};
 },[]);
 useEffect(()=>{
  if(!playing||!ready||failed||reduced||!inView)return;
  let id=0,last=performance.now();
  const frame=(now:number)=>{const delta=Math.max(0,(now-last)/1000);last=now;setSeconds(time=>Math.min(15,time+delta));id=requestAnimationFrame(frame);};
  id=requestAnimationFrame(frame);return()=>cancelAnimationFrame(id);
 },[playing,ready,failed,reduced,inView]);
 useEffect(()=>{if(seconds>=15)setPlaying(false);},[seconds]);
 const showViewer=()=>requestAnimationFrame(()=>viewport.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'}));
 const play=()=>{if(reduced||failed)return;setActive(true);setDetail(0);if(seconds>=15)setSeconds(0);setPlaying(true);};
 const seek=(time:number)=>{setSeconds(time);setPlaying(false);setDetail(0);if(!reduced&&!failed)setActive(true);};
 const selectView=(index:number)=>{setDetail(index);setSeconds(15);setPlaying(false);setCameraNote('Выбранный ракурс');if(!reduced&&!failed)setActive(true);showViewer();};
 const move=(action:CameraAction)=>{
  if(action==='reset'){setDetail(0);setSeconds(15);setPlaying(false);}
  setCommand(previous=>({id:previous.id+1,action}));
  setCameraNote({left:'Поворот влево',right:'Поворот вправо',in:'Приближение',out:'Отдаление',reset:'Исходный вид'}[action]);
 };
 const retry=async()=>{
  setRetrying(true);
  try{
   const module=await import('./Scene');module.clearModelCache(modelUrl);
   setAttempt(value=>value+1);setReady(false);setFailed(false);setActive(true);setPlaying(false);setSeconds(15);showViewer();
  }catch{onError();}finally{setRetrying(false);}
 };
 const stageIndex=seconds<3?0:seconds<6?1:seconds<10?2:seconds<13?3:4;
 const status=reduced?'Анимация отключена в соответствии с настройками устройства. Доступен статичный рендер.':failed?'Интерактивная сцена недоступна. Показан авторский рендер; вся информация сайта доступна.':active&&!ready?'Загружаем архитектурную модель…':playing?`Рождение архитектуры: ${phases[stageIndex].title.toLowerCase()}.`:ready&&seconds>=15?'Потяните сцену или используйте кнопки поворота и масштаба.':'15 секунд: от свободного участка до архитектурной концепции. Запуск — по вашему желанию.';
 return <div className="sequence" data-ready={ready} data-active={active}>
  <div className="viewer-workspace" ref={workspace}>
  <div className={`sequence-viewport view-${detail}`} ref={viewport}>
   <picture><source media="(max-width:600px)" srcSet={assetUrl('/images/architecture-mobile.webp')}/><img src={assetUrl(posterUrl)} alt="Авторская концептуальная визуализация: стеклянный коммерческий павильон с каменными поясами и вечерним освещением" loading="lazy" width="1920" height="1200"/></picture>
   {active&&inView&&!failed&&!reduced&&<div className={`canvas-layer ${ready?'is-ready':''}`}><SceneBoundary key={attempt} onError={onError}><Scene seconds={seconds} command={command} onReady={onReady} onError={onError} modelUrl={modelUrl} detail={detail}/></SceneBoundary></div>}
   <div className="scene-topline"><span>КОНЦЕПТ / 01</span><span>{active&&ready&&!failed?'ИНТЕРАКТИВНАЯ СЦЕНА':'АРХИТЕКТУРНОЕ ИССЛЕДОВАНИЕ'}</span></div>
   {active&&!ready&&!failed&&!reduced&&<div className="scene-loading"><span className="loading-orbit" aria-hidden="true"/><span>Подготавливаем пространство</span></div>}
   <div className="scene-bottomline"><span>{seconds>=15?views[detail].title:phases[stageIndex].title}</span><span aria-hidden="true">{String(Math.floor(seconds)).padStart(2,'0')} / 15 СЕК</span></div>
  {active&&!failed&&!reduced&&<div className="camera-tools"><div role="group" aria-label="Управление камерой">
   <button aria-label="Повернуть влево" title="Повернуть влево" onClick={()=>move('left')} disabled={!ready||seconds<15}>←</button>
   <button aria-label="Повернуть вправо" title="Повернуть вправо" onClick={()=>move('right')} disabled={!ready||seconds<15}>→</button>
   <button aria-label="Приблизить" title="Приблизить" onClick={()=>move('in')} disabled={!ready||seconds<15}>+</button>
   <button aria-label="Отдалить" title="Отдалить" onClick={()=>move('out')} disabled={!ready||seconds<15}>−</button>
   <button className="camera-reset" aria-label="Сбросить вид" onClick={()=>move('reset')} disabled={!ready}><span>Сбросить вид</span><span className="reset-icon" aria-hidden="true">↺</span></button>
  </div><span role="status" aria-label="Положение камеры">{cameraNote}</span></div>}
  </div>
  <div className="sequence-controls">
   <div className="playback-buttons">
    <button className="button button-light" onClick={playing?()=>setPlaying(false):play} disabled={reduced||failed}>{playing?'Пауза':seconds>=15?'Воспроизвести':'Продолжить'}<span aria-hidden="true">{playing?'Ⅱ':'▷'}</span></button>
    <button className="text-button" onClick={()=>seek(0)} disabled={reduced||failed}>Сначала</button>
    <button className="text-button" onClick={()=>{setSeconds(15);setPlaying(false);}}>Пропустить</button>
   </div>
   <label className="scrubber">Ход анимации<input aria-label="Ход анимации" type="range" min="0" max="15" step="0.05" value={seconds} disabled={reduced||failed} onChange={event=>seek(Number(event.target.value))}/><output aria-live="off">{seconds.toFixed(1)} с</output></label>
  </div>
  {!reduced&&!failed&&<div className="phase-navigation" aria-label="Этапы анимации">{phases.map((phase,index)=><button key={phase.title} aria-pressed={stageIndex===index} onClick={()=>seek(phase.time)}><span aria-hidden="true">0{index+1}</span>{phase.title}</button>)}</div>}
  <p className="scene-status" role="status" aria-label="Состояние архитектурной сцены">{status}</p>
  {failed&&!reduced&&<button className="button button-outline retry-button" onClick={retry} disabled={retrying}>{retrying?'Подготавливаем…':'Повторить загрузку 3D'}<span aria-hidden="true">↺</span></button>}

  </div>
  <p className="selected-view" role="status" aria-label="Выбранный ракурс"><strong>{views[detail].title}</strong><span>{views[detail].text}</span></p>
  <section className="architecture-detail" id="details" aria-labelledby="details-title">
   <div className="detail-heading"><p className="eyebrow">03 / АРХИТЕКТУРА В ДЕТАЛЯХ</p><h2 id="details-title">Целое складывается <br/><span>из продуманных решений.</span></h2><p>Выберите ракурс, чтобы исследовать демонстрационную концепцию. Описание относится к визуализации и не определяет характеристики реального проекта.</p></div>
   <div className="detail-selectors" aria-label="Детали концепции">{views.map((view,index)=><button key={view.title} aria-pressed={detail===index} onClick={()=>selectView(index)}><span className="detail-number">0{index+1}</span><span><strong>{view.title}</strong><span className="detail-copy">{view.text}</span></span><span aria-hidden="true">↗</span></button>)}</div>
  </section>
 </div>;
}
