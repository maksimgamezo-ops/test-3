import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';import {Mesh} from 'three';
import {resolvePhase} from '../lib/model-phase.ts';
const bytes=await readFile(new URL('../public/models/architecture.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
test('every exported glTF primitive resolves to its actual construction phase through parent nodes',()=>{
 let count=0;const phases=new Set<string>();
 gltf.scene.traverse(object=>{if(object instanceof Mesh){const phase=resolvePhase(object);assert.ok(phase,`missing phase for ${object.name}`);phases.add(phase);count++;}});
 assert.ok(count>=6);assert.deepEqual([...phases].sort(),['details','facade','floors','landscape','site','structure']);
});
