import Link from 'next/link';
export default function NotFound(){return <main id="main" className="error-page"><p className="eyebrow">404 / ЗА ПРЕДЕЛАМИ ПЛАНА</p><h1>Страница не найдена.</h1><p>Возможно, адрес изменился. Вернёмся к началу.</p><Link className="button button-light" href="/">На главную <span aria-hidden="true">↗</span></Link></main>;}
