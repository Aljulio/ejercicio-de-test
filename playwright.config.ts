import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000, 
  retries: 1,     
  
  use: {
    baseURL: 'https://www.demoblaze.com',
    headless: false,
    
    screenshot: 'on',      
    video: {
      mode: 'on',          
      size: { width: 1280, height: 720 }  
    },
    trace: 'on',          
    launchOptions: {
      slowMo: 500  
    }
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});