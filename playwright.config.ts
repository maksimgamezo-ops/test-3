import { defineConfig } from '@playwright/test';
import {existsSync} from 'node:fs';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const port=process.env.TEST_PORT||'3001';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.ts',workers:2,timeout:45000,use:{baseURL:`http://127.0.0.1:${port}`,headless:true},webServer:{command:`npm start -- --port ${port}`,url:`http://127.0.0.1:${port}`,reuseExistingServer:!process.env.CI,timeout:120000},projects:[{name:'chromium',use:{browserName:'chromium',launchOptions:{executablePath,args:['--no-sandbox','--enable-unsafe-swiftshader']}}}]});
