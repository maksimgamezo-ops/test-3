'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="main" className="error-page"><p className="eyebrow">НЕ УДАЛОСЬ ОТКРЫТЬ СТРАНИЦУ</p><h1>Попробуем ещё раз.</h1><p>Информация временно недоступна.</p><button className="button button-light" onClick={reset}>Повторить</button><a className="quiet-link" href="/contacts">Контакты</a></main>;}
