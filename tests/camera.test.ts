import {test} from 'node:test';import assert from 'node:assert/strict';
import {getCameraPose,orbitCamera} from '../lib/camera.ts';
test('authored camera reveals one building and detail views have distinct meaningful targets',()=>{
 const start=getCameraPose(0,0,false),end=getCameraPose(15,0,false);
 assert.notDeepEqual(start.position,end.position);assert.deepEqual(start.target,end.target);
 const space=getCameraPose(15,1,false),facade=getCameraPose(15,2,false);
 assert.notDeepEqual(space.target,end.target);assert.notDeepEqual(space.position,facade.position);
 assert.deepEqual(getCameraPose(-1,0,false),start);assert.deepEqual(getCameraPose(100,0,false),end);
 assert.notDeepEqual(getCameraPose(15,0,true).position,end.position);
});
test('keyboard camera commands rotate around the current target and bound zoom',()=>{
 let pose=getCameraPose(15,0,false),left=orbitCamera(pose,'left');
 assert.deepEqual(left.target,pose.target);assert.ok(left.position[0]<pose.position[0]);
 for(let i=0;i<100;i++)pose=orbitCamera(pose,'in');
 const distance=()=>Math.hypot(...pose.position.map((x,i)=>x-pose.target[i]));
 assert.ok(distance()>=24-1e-8);for(let i=0;i<100;i++)pose=orbitCamera(pose,'out');
 assert.ok(distance()<=100+1e-8);assert.ok(pose.position.every(Number.isFinite));
});
