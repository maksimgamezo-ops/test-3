import type { MetadataRoute } from 'next';import {siteUrl} from '@/lib/metadata';
export default function robots():MetadataRoute.Robots{const base=siteUrl();return {rules:{userAgent:'*',...(base?{allow:'/'}:{disallow:'/'})},...(base?{sitemap:new URL('/sitemap.xml',base).href}:{})};}
