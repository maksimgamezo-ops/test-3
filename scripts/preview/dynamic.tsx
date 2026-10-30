import {lazy,Suspense,type ComponentType} from 'react';
export default function dynamic(loader:()=>Promise<{default:ComponentType<any>}>) {
 const Lazy=lazy(loader);
 return function PreviewDynamic(props:Record<string,unknown>){return <Suspense fallback={null}><Lazy {...props}/></Suspense>;};
}
