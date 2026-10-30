import type {ReactNode} from 'react';
import Header from './Header';import Footer from './Footer';import MotionDirector from './MotionDirector';
import {company} from '@/content/company';
export default function SiteFrame({children}:{children:ReactNode}){
 return <><a className="skip-link" href="#main">Перейти к содержимому</a><Header/><MotionDirector/>{children}<Footer/><div className="mobile-actions" aria-label="Быстрая связь"><a href={company.phones[0].href}>Позвонить <span aria-hidden="true">↗</span></a><a href={`mailto:${company.email}`}>Написать <span aria-hidden="true">↗</span></a></div></>;
}
