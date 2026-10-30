import { test, expect } from '@playwright/test';
test('homepage provides meaningful navigation and honest contact links',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Пространства для развития бизнеса');
 await page.getByRole('link',{name:'О компании',exact:true}).first().click();
 await expect(page).toHaveURL(/\/about$/);
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.goto('/contacts');
 await expect(page.locator('main a[href="tel:+375447417527"]')).toBeVisible();
 await expect(page.locator('main a[href="tel:+375299069687"]')).toBeVisible();
 await expect(page.locator('main a[href="mailto:proekt.bauplan@gmail.com"]')).toBeVisible();
 await expect(page.locator('form')).toHaveCount(0);
});
test('mobile menu closes with Escape and returns focus',async({page})=>{
 await page.setViewportSize({width:390,height:844}); await page.goto('/');
 const button=page.getByRole('button',{name:'Меню',exact:true});
 await button.click(); await expect(button).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape'); await expect(button).toHaveAttribute('aria-expanded','false');
 await expect(button).toBeFocused();
});
test('every content route and 404 has a meaningful heading',async({page})=>{
 for(const path of ['/about','/directions','/approach','/projects','/contacts','/privacy']){
  const response=await page.goto(path); expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
 }
 const response=await page.goto('/does-not-exist');expect(response?.status()).toBe(404);
 await expect(page.getByRole('heading',{level:1})).toContainText('Страница не найдена');
});
