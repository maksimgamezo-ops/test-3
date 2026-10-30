import {test,expect} from '@playwright/test';
test('sequence plays, pauses, seeks backwards, replays and skips',async({page})=>{
 await page.goto('/');await page.locator('#creation').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
 await expect(page.locator('.sequence')).toHaveAttribute('data-ready','true',{timeout:30000});
 const range=page.getByRole('slider',{name:'Ход анимации'});
 await expect.poll(async()=>Number(await range.inputValue())).toBeGreaterThan(.5);
 await page.getByRole('button',{name:'Пауза',exact:true}).click();
 const paused=Number(await range.inputValue());await page.waitForTimeout(250);
 expect(Number(await range.inputValue())).toBeCloseTo(paused,1);
 await range.fill('10');await expect(range).toHaveValue('10');
 await range.fill('3');await expect(range).toHaveValue('3');
 await page.getByRole('button',{name:'Сначала',exact:true}).click();await expect(range).toHaveValue('0');
 await page.getByRole('button',{name:'Продолжить',exact:true}).click();
 await expect.poll(async()=>Number(await range.inputValue())).toBeGreaterThan(.2);
 await page.getByRole('button',{name:'Пропустить',exact:true}).click();await expect(range).toHaveValue('15');
 await expect(page.getByRole('button',{name:'Воспроизвести',exact:true})).toBeVisible();
 await page.screenshot({path:'docs/previews/interactive.png'});
});
test('model load failure leaves real content and poster usable',async({page})=>{
 await page.route('**/models/architecture.glb',route=>route.abort());
 await page.goto('/');await page.locator('#creation').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
 await expect(page.getByRole('status',{name:'Состояние архитектурной сцены'})).toContainText('Интерактивная сцена недоступна',{timeout:30000});
 await expect(page.locator('.sequence-viewport img')).toBeVisible();
 await expect(page.locator('footer a[href="tel:+375447417527"]')).toBeVisible();
});
