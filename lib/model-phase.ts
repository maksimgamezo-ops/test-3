export type Phase='site'|'floors'|'structure'|'facade'|'details'|'landscape';
type SceneNode={name:string;parent:SceneNode|null};
const phases=new Set<string>(['site','floors','structure','facade','details','landscape']);
export function resolvePhase(node:SceneNode):Phase|undefined{
 let current:SceneNode|null=node;
 while(current){if(phases.has(current.name))return current.name as Phase;current=current.parent;}
 return undefined;
}
