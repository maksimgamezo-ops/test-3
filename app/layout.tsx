import type {Metadata} from 'next';
import localFont from 'next/font/local';
import SiteFrame from '@/components/SiteFrame';
import {company} from '@/content/company';import {siteUrl} from '@/lib/metadata';
import './globals.css';

const noto=localFont({src:[{path:'../public/fonts/NotoSans-Regular.ttf',weight:'400'},{path:'../public/fonts/NotoSans-Bold.ttf',weight:'700'}],display:'swap',variable:'--font-sans'});
export const metadata:Metadata={metadataBase:siteUrl(),title:{default:'BAUPLANINVEST — пространства для развития бизнеса',template:'%s — BAUPLANINVEST'},description:company.description,openGraph:{locale:'ru_BY',type:'website',siteName:company.brand},robots:{index:Boolean(siteUrl()),follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){
 const data={'@context':'https://schema.org','@type':'Organization',name:company.legalName,alternateName:company.brand,taxID:company.unp,telephone:company.phones.map(p=>p.label),email:company.email,address:company.address,areaServed:'BY',...(siteUrl()?{url:siteUrl()!.href}:{})};
 return <html lang="ru-BY" className={noto.variable}><body><SiteFrame>{children}</SiteFrame><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/></body></html>;
}
