'use client';
import {Suspense,useCallback,useEffect,useMemo,useRef,useState,type RefObject} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,Lightformer,OrbitControls,useGLTF} from '@react-three/drei';
import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib';
import * as THREE from 'three';
import {getStageState} from '@/lib/sequence';
import {resolvePhase} from '@/lib/model-phase';
import {getCameraPose,orbitCamera,type CameraCommand,type CameraPose} from '@/lib/camera';

type Props={seconds:number;onReady:()=>void;onError:()=>void;modelUrl:string;detail:number;command:CameraCommand};
export function clearModelCache(url:string){useGLTF.clear(url);}
function useLowCostRendering(){
 const gl=useThree(state=>state.gl),width=useThree(state=>state.size.width);
 return useMemo(()=>{
  const context=gl.getContext(),debug=context.getExtension('WEBGL_debug_renderer_info');
  const renderer=debug?String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'';
  return width<700||/SwiftShader|llvmpipe|software/i.test(renderer);
 },[gl,width]);
}
function Model({seconds,onReady,onError,modelUrl}:Pick<Props,'seconds'|'onReady'|'onError'|'modelUrl'>){
 const {gl,camera,scene}=useThree();
 const gltf=useGLTF(modelUrl),lowCost=useLowCostRendering();
 const object=useMemo(()=>{
  const clone=gltf.scene.clone(true);
  clone.traverse(node=>{
   if(!(node instanceof THREE.Mesh))return;
   node.castShadow=true;node.receiveShadow=true;
   const copy=(material:THREE.Material)=>{
    const next=material.clone();next.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,-1,0),30)];next.clipShadows=true;
    if(next instanceof THREE.MeshStandardMaterial)next.userData.baseEmission=next.emissiveIntensity;
    if(lowCost&&next instanceof THREE.MeshPhysicalMaterial&&next.transmission>0){next.transmission=0;next.transparent=true;next.opacity=.64;next.depthWrite=false;next.roughness=.22;}
    return next;
   };
   node.material=Array.isArray(node.material)?node.material.map(copy):copy(node.material);
  });return clone;
 },[gltf,lowCost]);
 useEffect(()=>{
  let disposed=false;
  gl.compileAsync(object,camera,scene).then(()=>{if(!disposed)onReady();}).catch(()=>{if(!disposed)onError();});
  return()=>{disposed=true;object.traverse(node=>{
   if(node instanceof THREE.Mesh)(Array.isArray(node.material)?node.material:[node.material]).forEach(material=>material.dispose());
  });};
 },[object,onReady,onError,gl,camera,scene]);
 useEffect(()=>{
  const state=getStageState(seconds);
  object.traverse(node=>{
   if(!(node instanceof THREE.Mesh))return;
   const phase=resolvePhase(node),progress=phase?state[phase]:1;
   node.visible=progress>0;
   (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>{
    if(material.clippingPlanes)material.clippingPlanes[0].constant=progress*15;
    if(material instanceof THREE.MeshStandardMaterial)material.emissiveIntensity=(material.userData.baseEmission??1)*state.details;
   });
  });
 },[seconds,object]);
 return <primitive object={object}/>;
}
function CameraRig({seconds,detail,command,controls,moving,instant}:{seconds:number;detail:number;command:CameraCommand;controls:RefObject<OrbitControlsImpl|null>;moving:RefObject<boolean>;instant:boolean}){
 const {camera,size,invalidate}=useThree();
 const desired=useRef<CameraPose>(getCameraPose(seconds,detail,size.width<600));
 const lastCommand=useRef(command.id);
 const setGoal=useCallback((pose:CameraPose)=>{
  desired.current=pose;moving.current=!instant;
  if(instant){camera.position.set(...pose.position);const target=new THREE.Vector3(...pose.target);controls.current?.target.copy(target);camera.lookAt(target);}
  invalidate();
 },[camera,controls,invalidate,instant,moving]);
 useEffect(()=>{
  setGoal(getCameraPose(seconds,detail,size.width<600));
 },[seconds,detail,size.width,setGoal]);
 useEffect(()=>{
  if(lastCommand.current===command.id)return;lastCommand.current=command.id;
  const target=controls.current?.target??new THREE.Vector3(0,4,0);
  const current:CameraPose={position:camera.position.toArray() as [number,number,number],target:target.toArray() as [number,number,number]};
  setGoal(command.action==='reset'?getCameraPose(15,0,size.width<600):orbitCamera(current,command.action));
 // A command is an event: changing detail/size follows the authored rig above.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[command.id]);
 useFrame((_,delta)=>{
  if(!moving.current)return;
  const position=new THREE.Vector3(...desired.current.position),target=new THREE.Vector3(...desired.current.target);
  const alpha=1-Math.exp(-Math.min(delta,.1)*7);
  camera.position.lerp(position,alpha);
  if(controls.current){controls.current.target.lerp(target,alpha);camera.lookAt(controls.current.target);}
  else camera.lookAt(target);
  const targetDistance=controls.current?.target.distanceTo(target)??0;
  if(camera.position.distanceTo(position)<.008&&targetDistance<.008){camera.position.copy(position);controls.current?.target.copy(target);moving.current=false;}
  else invalidate();
 });return null;
}
function ContextLossMonitor({onError}:{onError:()=>void}){
 const gl=useThree(state=>state.gl);
 useEffect(()=>{const canvas=gl.domElement;const lost=(event:Event)=>{event.preventDefault();onError();};canvas.addEventListener('webglcontextlost',lost);return()=>canvas.removeEventListener('webglcontextlost',lost);},[gl,onError]);return null;
}
function Lighting({seconds}:{seconds:number}){
 const lowCost=useLowCostRendering(),state=getStageState(seconds);
 return <>  <ambientLight intensity={.22}/><hemisphereLight args={['#6f98bb','#1c2730',.55]}/>
  <directionalLight position={[8,28,18]} intensity={1.05} color="#c5daff" castShadow={!lowCost} shadow-bias={-.0004} shadow-mapSize={[1024,1024]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={25} shadow-camera-bottom={-25}/>
  <directionalLight position={[-25,10,10]} intensity={.65} color="#ffc78e"/>
  {[-9,0,9].map((x,i)=><pointLight key={x} position={[x,3.5+i*3.2,2]} color="#ffb666" intensity={state.details*100}/>)}
</>;
}
export default function Scene(props:Props){
 const controls=useRef<OrbitControlsImpl>(null),moving=useRef(false),software=useRef(false);
 const [lightweight,setLightweight]=useState(false);
 useEffect(()=>{const media=matchMedia('(max-width:700px)');const update=()=>setLightweight(software.current||media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 const gridOpacity=Math.max(0,1-props.seconds/5);
 return <Canvas frameloop="demand" shadows dpr={lightweight?.75:[1,1.5]} camera={{position:[39,23,49],fov:44,near:.1,far:350}} gl={{antialias:true,alpha:false,localClippingEnabled:true,powerPreference:'low-power'}} onCreated={({gl,size})=>{
  const context=gl.getContext(),debug=context.getExtension('WEBGL_debug_renderer_info');
  software.current=!!debug&&/SwiftShader|llvmpipe|software/i.test(String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)));setLightweight(software.current||size.width<700);
  gl.setClearColor('#101e29');gl.domElement.setAttribute('aria-label','Интерактивная концептуальная модель коммерческого здания');gl.domElement.setAttribute('role','img');
 }}>
  <ContextLossMonitor onError={props.onError}/><fog attach="fog" args={['#101e29',60,170]}/>
  <Lighting seconds={props.seconds}/>
  {gridOpacity>0&&<gridHelper args={[52,26,'#bba581','#526574']} position={[0,.13,0]}><lineBasicMaterial attach="material" transparent opacity={gridOpacity*.45} depthWrite={false}/></gridHelper>}
  <Suspense fallback={null}>
   <Environment resolution={128}>
    <Lightformer form="rect" intensity={1.2} color="#98bfdc" position={[0,22,0]} rotation={[Math.PI/2,0,0]} scale={[40,40,1]}/>
    <Lightformer form="rect" intensity={1} color="#6794ba" position={[0,10,25]} scale={[40,20,1]}/>
    <Lightformer form="rect" intensity={1.6} color="#edbc83" position={[-22,7,0]} rotation={[0,Math.PI/2,0]} scale={[15,8,1]}/>
   </Environment>
   <Model seconds={props.seconds} onReady={props.onReady} onError={props.onError} modelUrl={props.modelUrl}/>
  </Suspense>
  <CameraRig seconds={props.seconds} detail={props.detail} command={props.command} controls={controls} moving={moving} instant={lightweight}/>
  <OrbitControls ref={controls} enabled={props.seconds>=15} enablePan={false} enableZoom={false} minPolarAngle={.65} maxPolarAngle={1.45} minAzimuthAngle={-.7} maxAzimuthAngle={1.45} target={[0,4,0]} onStart={()=>{moving.current=false;}}/>
 </Canvas>;
}
