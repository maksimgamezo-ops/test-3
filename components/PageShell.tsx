import Link from 'next/link';
import type {ReactNode} from 'react';
export default function PageShell({index,title,intro,children}:{index:string;title:string;intro:string;children:ReactNode}){return <main id="main" className="inner-page"><section className="page-lead"><Link href="/" className="breadcrumb">Главная <span aria-hidden="true">/</span> {index}</Link><p className="eyebrow">BAUPLANINVEST / {index}</p><h1>{title}</h1><p className="page-intro">{intro}</p></section>{children}</main>;}
