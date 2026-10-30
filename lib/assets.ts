/** Public paths normally stay unchanged; the downloadable preview embeds the same assets. */
export function assetUrl(path:string):string{
 if(typeof window==='undefined')return path;
 return (window as Window&{__BAUPLAN_ASSETS__?:Record<string,string>}).__BAUPLAN_ASSETS__?.[path]??path;
}
