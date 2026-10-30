import type { MetadataRoute } from 'next';import {siteUrl} from '@/lib/metadata';
export default function sitemap():MetadataRoute.Sitemap{const base=siteUrl();if(!base)return [];return ['/','/about','/directions','/approach','/projects','/contacts'].map(path=>({url:new URL(path,base).href,changeFrequency:'monthly',priority:path==='/'?1:.7}));}
