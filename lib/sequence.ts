export const DURATION = 15;
const smooth = (time: number, start: number, end: number) => {
 const x = Math.min(1, Math.max(0, (time - start) / (end - start)));
 return x * x * (3 - 2 * x);
};
export function getStageState(seconds: number) {
 const t = Math.max(0, Math.min(DURATION, Number.isFinite(seconds) ? seconds : 0));
 return {
  site: 1, floors: smooth(t,3,6), structure: smooth(t,5,8),
  facade: smooth(t,6,10), details: smooth(t,10,13), landscape: smooth(t,10,13),
  progress: t / DURATION, cameraAngle: smooth(t,0,15) * .12,
 };
}
