const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function exploreWorkspaceDeep() {
  const apiCaptured = [];
  const discoveredScreens = [];

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

    page.on('response', async res => {
      const u = res.url();
      if (u.includes('getfreed.ai/api') && !u.includes('csp-report') && !u.includes('analytics_batch_events')) {
        let body = '';
        try { body = await res.text(); } catch (e) {}
        apiCaptured.push({
          method: res.request().method(),
          url: u,
          status: res.status(),
          body: body.slice(0, 25000)
        });
        console.log(`[API ${res.status()}] ${res.request().method()} ${u}`);
      }
    });

    console.log('Navigating to https://secure.getfreed.ai/ ...');
    await page.goto('https://secure.getfreed.ai/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(8000);

    // If still on onboarding-personalization animation, wait a bit more
    if (page.url().includes('onboarding')) {
      console.log('Still on onboarding:', page.url(), 'waiting 10s...');
      await page.waitForTimeout(10000);
    }

    console.log('Workspace URL:', page.url());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '32-workspace-landing-desktop.png'), fullPage: true });

    const extractDOM = async (label) => {
      const info = await page.evaluate(() => ({
        url: location.href,
        title: document.title,
        bodyText: document.body.innerText,
        links: Array.from(document.querySelectorAll('a')).map(a => ({
          text: (a.innerText || '').trim().replace(/\s+/g, ' '),
          href: a.href
        })).filter(a => a.text || a.href),
        buttons: Array.from(document.querySelectorAll('button, [role="button"], [role="tab"], [role="menuitem"], [ data-testid ]')).map(b => ({
          tag: b.tagName,
          role: b.getAttribute('role'),
          text: (b.innerText || '').trim().replace(/\s+/g, ' '),
          ariaLabel: b.getAttribute('aria-label'),
          id: b.id,
          testId: b.getAttribute('data-testid')
        })).filter(b => b.text || b.ariaLabel || b.testId),
        inputs: Array.from(document.querySelectorAll('input, select, textarea, [contenteditable="true"]')).map(i => ({
          tag: i.tagName,
          type: i.getAttribute('type'),
          placeholder: i.getAttribute('placeholder'),
          id: i.id,
          name: i.getAttribute('name'),
          ariaLabel: i.getAttribute('aria-label')
        }))
      }));
      discoveredScreens.push({ label, ...info });
      return info;
    };

    const initialDOM = await extractDOM('Workspace Landing');
    console.log('Initial Workspace DOM Summary:');
    console.log('URL:', initialDOM.url);
    console.log('Body Text:\n', initialDOM.bodyText.slice(0, 2500));
    console.log('Buttons:\n', JSON.stringify(initialDOM.buttons.slice(0, 50), null, 2));
    console.log('Links:\n', JSON.stringify(initialDOM.links, null, 2));
    console.log('Inputs:\n', JSON.stringify(initialDOM.inputs, null, 2));

    await context.storageState({ path: STATE_PATH });
    fs.writeFileSync(path.join(__dirname, 'workspace-initial-dom.json'), JSON.stringify(discoveredScreens, null, 2));
    fs.writeFileSync(path.join(__dirname, 'workspace-api-captured.json'), JSON.stringify(apiCaptured, null, 2));
  } finally {
    await browser.close();
  }
}

exploreWorkspaceDeep().catch(err => {
  console.error(err);
  process.exit(1);
});
