'use client';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getStageState } from '@/lib/sequence';
import {resolvePhase} from '@/lib/model-phase';

type Props={seconds:number;resetKey:number;onReady:()=>void;onError:()=>void;modelUrl:string;detail?:number};
function Model({seconds,onReady,modelUrl}:Pick<Props,'seconds'|'onReady'|'modelUrl'>){
 const gltf=useGLTF(modelUrl);
 const object=useMemo(()=>{
  const clone=gltf.scene.clone(true);
  clone.traverse(o=>{if(o instanceof THREE.Mesh){
   o.castShadow=true;o.receiveShadow=true;
   const copy=(m:THREE.Material)=>{const next=m.clone();next.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,-1,0),30)];next.clipShadows=true;return next;};
   o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);
  }});return clone;
 },[gltf]);
 useEffect(()=>{onReady();return()=>{object.traverse(o=>{if(o instanceof THREE.Mesh){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});};},[object,onReady]);
 useEffect(()=>{
  const state=getStageState(seconds);
  object.traverse(o=>{
   if(!(o instanceof THREE.Mesh))return;
   const key=resolvePhase(o);
   const progress=key?state[key]:1;
   o.visible=progress>0;
   const mats=Array.isArray(o.material)?o.material:[o.material];
   mats.forEach(m=>{if(m.clippingPlanes)m.clippingPlanes[0].constant=progress*15;});
  });
 },[seconds,object]);
 return <primitive object={object}/>;
}
function CameraRig({seconds,detail=0,resetKey}:Pick<Props,'seconds'|'detail'|'resetKey'>){
 const {camera,size,invalidate}=useThree();
 useEffect(()=>{
  const angle=getStageState(seconds).cameraAngle;
  const mobile=size.width<600;
  const distance=detail?1.05:mobile?1.48:1;
  camera.position.set((35-Math.sin(angle)*22)*distance,(22+(detail?2:0))*distance,(42+Math.sin(angle)*15)*distance);
  camera.lookAt(detail===1?-8:detail===2?8:0,detail?6:4,0);
  invalidate();
 },[seconds,detail,resetKey,size.width,camera,invalidate]);return null;
}
function ContextLossMonitor({onError}:{onError:()=>void}){
 const gl=useThree(state=>state.gl);
 useEffect(()=>{
  const canvas=gl.domElement;
  const lost=(event:Event)=>{event.preventDefault();onError();};
  canvas.addEventListener('webglcontextlost',lost);
  return()=>canvas.removeEventListener('webglcontextlost',lost);
 },[gl,onError]);
 return null;
}
export default function Scene(props:Props){
 const controls=useRef<React.ComponentRef<typeof OrbitControls>>(null);
 useEffect(()=>{controls.current?.reset();},[props.resetKey]);
 return <Canvas frameloop="demand" shadows dpr={[1,1.5]} camera={{position:[35,22,42],fov:44,near:.1,far:350}} gl={{antialias:true,alpha:false,localClippingEnabled:true,powerPreference:'low-power'}} onCreated={({gl})=>{
  gl.setClearColor('#17242d');gl.domElement.setAttribute('aria-label','Интерактивная концептуальная модель коммерческого здания');gl.domElement.setAttribute('role','img');
 }}>
  <ContextLossMonitor onError={props.onError}/>
  <fog attach="fog" args={['#17242d',75,230]}/>
  <ambientLight intensity={.35}/><hemisphereLight args={['#abc7e3','#444633',.8]}/>
  <directionalLight position={[5,26,15]} intensity={1.6} color="#c5daff" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={25} shadow-camera-bottom={-25}/>
  <directionalLight position={[-25,10,10]} intensity={.9} color="#ffd19a"/>
  <pointLight position={[-9,5,2]} color="#ffc17a" intensity={150}/><pointLight position={[0,8,2]} color="#ffc17a" intensity={150}/><pointLight position={[9,10,2]} color="#ffc17a" intensity={150}/><Suspense fallback={null}>
   <Environment resolution={128}>
    <Lightformer form="rect" intensity={2} color="#d7e7fa" position={[0,22,0]} rotation={[Math.PI/2,0,0]} scale={[40,40,1]}/>
    <Lightformer form="rect" intensity={2} color="#8bb4d4" position={[0,10,25]} scale={[40,20,1]}/>
    <Lightformer form="rect" intensity={2} color="#edbc83" position={[-22,7,0]} rotation={[0,Math.PI/2,0]} scale={[15,8,1]}/>
   </Environment>
   <Model seconds={props.seconds} onReady={props.onReady} modelUrl={props.modelUrl}/>
  </Suspense>
  <CameraRig seconds={props.seconds} detail={props.detail} resetKey={props.resetKey}/>
  <OrbitControls ref={controls} enabled={props.seconds>=15} enablePan={false} enableZoom={false} minPolarAngle={Math.PI/3.8} maxPolarAngle={Math.PI/2.25} minAzimuthAngle={.25} maxAzimuthAngle={1.25} target={[props.detail===1?-8:props.detail===2?8:0,props.detail?6:4,0]}/>
 </Canvas>;
}
