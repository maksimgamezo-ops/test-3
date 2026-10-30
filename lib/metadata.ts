import type {Metadata} from 'next';
import {company} from '@/content/company';
export function siteUrl(){
 const value=process.env.SITE_URL;
 if(!value)return undefined;
 try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol))return undefined;return url;}catch{return undefined;}
}
export function pageMetadata(title:string,description:string,path:string):Metadata{
 const base=siteUrl();
 return {title,description,alternates:base?{canonical:new URL(path,base).href}:undefined,openGraph:{title,description,locale:'ru_BY',type:'website',siteName:company.brand,...(base?{url:new URL(path,base).href}:{})}};
}
