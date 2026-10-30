import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStageState } from '../lib/sequence.ts';
test('15-second sequence assembles in order and is deterministic when scrubbing backwards', () => {
 const a=getStageState(0), b=getStageState(3), c=getStageState(6), d=getStageState(10), e=getStageState(13), f=getStageState(15);
 assert.equal(a.floors,0); assert.equal(b.floors,0); assert.equal(c.floors,1);
 assert.equal(d.facade,1); assert.equal(e.landscape,1); assert.equal(f.details,1);
 getStageState(15); assert.deepEqual(getStageState(0),a);
 getStageState(10); assert.deepEqual(getStageState(3),b);
 assert.equal(f.progress,1);
});
test('invalid or out-of-range time is bounded without NaN scene transforms',()=>{
 assert.deepEqual(getStageState(-5),getStageState(0));
 assert.deepEqual(getStageState(40),getStageState(15));
 assert.deepEqual(getStageState(NaN),getStageState(0));
});
