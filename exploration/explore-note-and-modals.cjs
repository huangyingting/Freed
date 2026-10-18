const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function exploreNoteAndModals() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  try {
    const context = await browser.newContext({
      storageState: STATE_PATH,
      viewport: { width: 1440, height: 900 },
      permissions: ['microphone', 'clipboard-read', 'clipboard-write'],
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // 1. Check John Smith visit with completed Clinical Evidence answer + End visit
    await page.goto('https://secure.getfreed.ai/visit/c258ee90-3e63-4bae-baef-cbfeed40ec69', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '57-auth-clinical-evidence-complete.png') });
    console.log('Visit text preview:\n', (await page.evaluate(() => document.body.innerText)).slice(0, 2500));

    // 2. Check New Template modal/menu and New Phrase modal on /templates
    await page.goto('https://secure.getfreed.ai/templates', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const newTmplBtn = await page.$('button:has-text("New template")');
    if (newTmplBtn) {
      await newTmplBtn.click().catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '58-auth-new-template-modal.png') });
      console.log('New Template Modal text:\n', (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
      await page.keyboard.press('Escape');
    }

    await page.goto('https://secure.getfreed.ai/templates?libraryId=dot-phrases', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const newPhraseBtn = await page.$('button:has-text("New phrase")');
    if (newPhraseBtn) {
      await newPhraseBtn.click().catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '59-auth-new-phrase-modal.png') });
      console.log('New Phrase Modal text:\n', (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
    }
  } finally {
    await browser.close();
  }
}

exploreNoteAndModals().catch(err => {
  console.error(err);
  process.exit(1);
});
