import {test,expect} from '@playwright/test';
test('reduced motion shows static architecture and mobile page does not overflow',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});
 await page.goto('/');await page.locator('#creation').scrollIntoViewIfNeeded();
 await expect(page.locator('.sequence canvas')).toHaveCount(0);
 await expect(page.getByRole('status',{name:'Состояние архитектурной сцены'})).toContainText('Анимация отключена');
 await expect(page.getByRole('button',{name:'Воспроизвести',exact:true})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('server content remains useful without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await expect(page.locator('footer a[href="mailto:proekt.bauplan@gmail.com"]')).toBeVisible();
 await page.goto('/projects');await expect(page.getByRole('heading',{level:1})).toContainText('Проекты в разработке');
 await context.close();
});
test('staging does not invent a canonical domain or collect inquiries',async({page})=>{
 await page.goto('/contacts');await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
 await expect(page.locator('form')).toHaveCount(0);
 await expect(page.locator('html')).toHaveAttribute('lang','ru-BY');
 const response=await page.request.get('/');expect(response.headers()['x-content-type-options']).toBe('nosniff');
});
