const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function exploreFinalDetails() {
  const detailLog = [];
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

    const snapshot = async (stepName, fileName) => {
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, fileName), fullPage: false });
      const dom = await page.evaluate(() => ({
        url: location.href,
        bodyText: document.body.innerText.slice(0, 6000),
        testIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => ({
          testId: el.getAttribute('data-testid'),
          tag: el.tagName,
          text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 120),
          ariaLabel: el.getAttribute('aria-label')
        }))
      }));
      detailLog.push({ stepName, fileName, ...dom });
      console.log(`=== [${stepName}] (${dom.url}) ===`);
      console.log('Body Preview:', dom.bodyText.replace(/\n+/g, ' | ').slice(0, 500));
      return dom;
    };

    // 1. Explore /templates subtabs and template detail editor
    await page.goto('https://secure.getfreed.ai/templates', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    // Click Returning Patient row
    const returningRow = await page.$('text="Returning Patient"');
    if (returningRow) {
      await returningRow.click().catch(() => {});
      await page.waitForTimeout(2500);
      await snapshot('25-Template-Editor-Returning-Patient', '44-auth-template-editor.png');
    }

    await page.goto('https://secure.getfreed.ai/templates', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click Freed library tab
    const freedLibTab = await page.$('button:has-text("Freed library"), [role="tab"]:has-text("Freed library")');
    if (freedLibTab) {
      await freedLibTab.click().catch(() => {});
      await page.waitForTimeout(2500);
      await snapshot('26-Templates-Freed-Library', '44b-auth-templates-freed-library.png');
    }

    // Click Phrases tab
    const phrasesTab = await page.$('button:has-text("Phrases"), [role="tab"]:has-text("Phrases")');
    if (phrasesTab) {
      await phrasesTab.click().catch(() => {});
      await page.waitForTimeout(2500);
      await snapshot('27-Templates-Phrases', '44c-auth-templates-phrases.png');
    }

    // 2. Inspect John Smith visit note & AI Chat / Clinical Evidence
    await page.goto('https://secure.getfreed.ai/visit/c258ee90-3e63-4bae-baef-cbfeed40ec69', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    await snapshot('28-John-Smith-Full-Artifact', '54-auth-john-smith-artifact.png');

    // Test Upload transcript button modal/popover
    const uploadTransBtn = await page.$('[data-testid="upload-transcript-button"]');
    if (uploadTransBtn) {
      await uploadTransBtn.click().catch(() => {});
      await page.waitForTimeout(1500);
      await snapshot('29-Upload-Transcript-Dialog', '54b-auth-upload-transcript.png');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Test AI Chat / Clinical Evidence input
    const chatInput = await page.$('[data-testid="aiux-chat-input"] textarea, [data-testid="aiux-chat-input"] input, textarea[placeholder*="Ask" i]');
    if (chatInput) {
      await chatInput.fill('What is the target BP for this patient with diabetes and hypertension?');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(6000);
      await snapshot('30-AI-Chat-Clinical-Evidence-Response', '54c-auth-clinical-evidence-response.png');
    }

    // 3. Responsive viewports on authenticated workspace
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await snapshot('31-Auth-Workspace-Tablet', '55-auth-workspace-tablet.png');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(2000);
    await snapshot('32-Auth-Workspace-Mobile', '56-auth-workspace-mobile.png');

    fs.writeFileSync(path.join(__dirname, 'final-details-log.json'), JSON.stringify(detailLog, null, 2));
    console.log('Saved final-details-log.json');
  } finally {
    await browser.close();
  }
}

exploreFinalDetails().catch(err => {
  console.error(err);
  process.exit(1);
});
