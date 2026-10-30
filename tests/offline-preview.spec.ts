import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const file=path.resolve('deliverables/BAUPLANINVEST.html');
test('self-contained document renders offline and every main route works',async({page,context})=>{
 await context.setOffline(true);const external:string[]=[];
 page.on('request',request=>{if(/^https?:/.test(request.url()))external.push(request.url());});
 await page.setContent(await readFile(file,'utf8'));await expect(page.getByRole('heading',{level:1})).toContainText('Пространства');
 for(const name of ['О компании','Направления','Подход','Проекты','Контакты']){
  await page.getByRole('navigation',{name:'Основная навигация',exact:true}).getByRole('link',{name,exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
 }
 await expect(page.locator('main a[href="tel:+375447417527"]')).toBeVisible();
 expect(external).toEqual([]);
});
test('self-contained document has the actual interactive GLB and camera controls offline',async({page,context})=>{
 await context.setOffline(true);await page.setContent(await readFile(file,'utf8'));
 await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
 await expect(page.locator('.sequence')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.getByRole('button',{name:'Пропустить',exact:true}).click();
 await page.getByRole('button',{name:'Повернуть вправо',exact:true}).click();
 await expect(page.getByRole('status',{name:'Положение камеры'})).toContainText('Поворот вправо');
 await expect(page.locator('.sequence canvas')).toHaveCount(1);
});
test('offline skip link preserves the selected page instead of returning home',async({page,context})=>{
 await context.setOffline(true);await page.setContent(await readFile(file,'utf8'));
 await page.getByRole('navigation',{name:'Основная навигация',exact:true}).getByRole('link',{name:'О компании',exact:true}).click();
 const heading=await page.getByRole('heading',{level:1}).textContent();
 await page.getByRole('link',{name:'Перейти к содержимому',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{level:1})).toHaveText(heading!);
 await expect(page.locator('main')).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(page.locator('header .wordmark')).not.toBeFocused();
});
test('standalone distribution includes full copyright and permission notices for bundled libraries',async({page})=>{
 await page.setContent(await readFile(file,'utf8'));
 const notices=JSON.parse((await page.locator('#asset-licenses').textContent())!);
 expect(notices.libraries).toBeInstanceOf(Array);
 for(const name of ['react','react-dom','three','@react-three/fiber','zustand']){
  const license=notices.libraries.find((entry:{name:string})=>entry.name===name);
  expect(license,`license missing for ${name}`).toBeTruthy();
  expect(license.text).toContain('Permission is hereby granted');
  expect(license.text).toMatch(/copyright/i);
 }
 expect(notices.missing).toEqual([]);
});
