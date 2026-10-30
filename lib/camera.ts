export type CameraPose={position:[number,number,number];target:[number,number,number]};
export type CameraAction='left'|'right'|'in'|'out'|'reset';
export type CameraCommand={id:number;action:CameraAction};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function getCameraPose(seconds:number,detail:number,mobile:boolean):CameraPose{
 if(detail===1)return {position:mobile?[-7,12,43]:[-6,9,28],target:[-5,5.5,0]};
 if(detail===2)return {position:mobile?[44,16,28]:[29,12,17],target:[9,6.5,0]};
 const t=clamp(Number.isFinite(seconds)?seconds/15:0,0,1),ease=t*t*(3-2*t);
 const multiplier=mobile?1.4:1;
 return {position:[(39-12*ease)*multiplier,(23-7*ease)*multiplier,(49-15*ease)*multiplier],target:[0,4,0]};
}
export function orbitCamera(pose:CameraPose,action:Exclude<CameraAction,'reset'>):CameraPose{
 const [x,y,z]=pose.position.map((v,i)=>v-pose.target[i]);
 let radius=Math.hypot(x,y,z),theta=Math.atan2(x,z);
 const phi=Math.acos(clamp(y/Math.max(radius,.001),-1,1));
 if(action==='left')theta-=.14;if(action==='right')theta+=.14;
 if(action==='in')radius*=.84;if(action==='out')radius/=.84;
 radius=clamp(radius,24,100);theta=clamp(theta,-.7,1.45);
 return {position:[pose.target[0]+radius*Math.sin(phi)*Math.sin(theta),pose.target[1]+radius*Math.cos(phi),pose.target[2]+radius*Math.sin(phi)*Math.cos(theta)],target:[...pose.target]};
}
