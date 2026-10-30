import {useSyncExternalStore} from 'react';
const path=()=>{const route=window.location.hash.slice(1).split('::')[0];return route.startsWith('/')?route:'/';};
const subscribe=(onChange:()=>void)=>{window.addEventListener('hashchange',onChange);return()=>window.removeEventListener('hashchange',onChange);};
export function usePathname(){return useSyncExternalStore(subscribe,path,()=>'/');}
