import {test,expect} from '@playwright/test';
test('selecting a detail brings its real viewer and explanation into view',async({page})=>{
 await page.goto('/');
 const detail=page.getByRole('button',{name:/Организация пространства/});await detail.click();
 await expect(detail).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.sequence-viewport')).toBeInViewport({ratio:.5});
 await expect(page.getByRole('status',{name:'Выбранный ракурс'})).toContainText('Организация пространства');
});
test('camera buttons work with keyboard and reset restores the general view',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
 await expect(page.locator('.sequence')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.getByRole('button',{name:'Пропустить',exact:true}).click();
 const before=await page.locator('.sequence canvas').screenshot();
 const left=page.getByRole('button',{name:'Повернуть влево',exact:true});await left.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('status',{name:'Положение камеры'})).toContainText('Поворот влево');
 const after=await page.locator('.sequence canvas').screenshot();expect(after.equals(before)).toBe(false);
 await page.getByRole('button',{name:'Приблизить',exact:true}).click();
 await expect(page.getByRole('status',{name:'Положение камеры'})).toContainText('Приближение');
 await page.getByRole('button',{name:'Сбросить вид',exact:true}).click();
 await expect(page.getByRole('button',{name:/Общий вид/})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('status',{name:'Положение камеры'})).toContainText('Исходный вид');
 await expect(page.locator('.sequence-viewport')).toBeInViewport({ratio:.4});
});
test('failed model load can be retried successfully without reloading the page',async({page})=>{
 let fail=true;await page.route('**/models/architecture.glb',route=>fail?route.abort():route.continue());
 await page.goto('/');await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
 await expect(page.getByRole('status',{name:'Состояние архитектурной сцены'})).toContainText('недоступна',{timeout:30000});
 fail=false;await page.getByRole('button',{name:'Повторить загрузку 3D',exact:true}).click();
 await expect(page.locator('.sequence')).toHaveAttribute('data-ready','true',{timeout:30000});
 await expect(page.locator('.sequence canvas')).toHaveCount(1);
 await expect(page.getByRole('status',{name:'Состояние архитектурной сцены'})).not.toContainText('недоступна');
});
test('chapter links navigate to real sections and stay usable with reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const navigation=page.getByRole('navigation',{name:'Главы главной страницы'});
 await navigation.getByRole('link',{name:'04 — Подход',exact:true}).click();
 await expect(page).toHaveURL(/#approach$/);await expect(page.locator('#approach')).toBeInViewport();
 await navigation.getByRole('link',{name:'01 — Первое впечатление',exact:true}).click();
 await expect(page.locator('#hero')).toBeInViewport();
});
test('reading details on mobile pauses and disposes the offscreen viewer',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
 await expect(page.locator('.sequence')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.evaluate(()=>document.getElementById('details')!.scrollIntoView({behavior:'instant',block:'start'}));
 await expect(page.locator('.sequence canvas')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Пауза',exact:true})).toHaveCount(0);
});
