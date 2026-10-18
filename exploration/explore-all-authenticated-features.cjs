const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function exploreAllFeatures() {
  const apiCaptured = [];
  const featureLog = [];

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
          body: body.slice(0, 30000)
        });
        console.log(`[API ${res.status()}] ${res.request().method()} ${u}`);
      }
    });

    const snapshot = async (stepName, fileName) => {
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, fileName), fullPage: false });
      const dom = await page.evaluate(() => ({
        url: location.href,
        bodyText: document.body.innerText.slice(0, 4000),
        testIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => ({
          testId: el.getAttribute('data-testid'),
          tag: el.tagName,
          text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 120),
          ariaLabel: el.getAttribute('aria-label')
        })),
        buttons: Array.from(document.querySelectorAll('button, [role="button"], [role="tab"], [role="menuitem"]')).map(el => ({
          text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 100),
          ariaLabel: el.getAttribute('aria-label'),
          testId: el.getAttribute('data-testid')
        })).filter(b => b.text || b.ariaLabel || b.testId),
        inputs: Array.from(document.querySelectorAll('input, textarea, select, [contenteditable="true"]')).map(el => ({
          tag: el.tagName,
          type: el.getAttribute('type'),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label'),
          testId: el.getAttribute('data-testid')
        }))
      }));
      featureLog.push({ stepName, fileName, ...dom });
      console.log(`=== [${stepName}] (${dom.url}) ===`);
      console.log('TestIDs:', dom.testIds.map(t => `${t.testId}${t.text ? `(${t.text.slice(0, 30)})` : ''}`).join(', '));
      return dom;
    };

    console.log('1. Loading authenticated workspace...');
    await page.goto('https://secure.getfreed.ai/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(6000);
    await snapshot('01-Welcome-Modal', '33-auth-welcome-modal.png');

    // Click "Get started" on welcome modal if visible
    const getStartedBtn = await page.$('[data-testid="aiux-welcome-get-started"]');
    if (getStartedBtn) {
      await getStartedBtn.click();
      await page.waitForTimeout(3000);
      await snapshot('02-After-Welcome-Modal', '34-auth-after-welcome.png');
    }

    // Dismiss any tooltips/popovers if present or capture them first
    const closeBtns = await page.$$('button:has-text("Got it"), button:has-text("Skip"), button[aria-label="Close"]');
    for (const b of closeBtns) {
      await b.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    // 2. Click on the example visit item in VisitList-List
    const visitItems = await page.$$('[data-testid="visit-item-button"]');
    console.log('Found visit items:', visitItems.length);
    if (visitItems.length > 0) {
      await visitItems[0].click();
      await page.waitForTimeout(3000);
      await snapshot('03-First-Visit-Selected', '35-auth-visit-selected.png');
    }

    // If there are multiple visit items, check the second one too
    const allVisits = await page.$$('[data-testid="visit-item-button"]');
    if (allVisits.length > 1) {
      await allVisits[1].click();
      await page.waitForTimeout(3000);
      await snapshot('04-Second-Visit-Selected', '36-auth-second-visit-selected.png');
    }

    // 3. Click New Visit button
    const newVisitBtn = await page.$('[data-testid="aiux-new-visit-button"]');
    if (newVisitBtn) {
      await newVisitBtn.click();
      await page.waitForTimeout(2500);
      await snapshot('05-New-Visit-Workspace', '37-auth-new-visit.png');
    }

    // 4. Explore Visit List filters & search
    const searchToggle = await page.$('[data-testid="visit-search-toggle"]');
    if (searchToggle) {
      await searchToggle.click();
      await page.waitForTimeout(1000);
      await snapshot('06-Visit-Search-Open', '38-auth-visit-search.png');
    }

    const filterBtn = await page.$('[data-testid="aiux-filter-button"]');
    if (filterBtn) {
      await filterBtn.click();
      await page.waitForTimeout(1000);
      await snapshot('07-Visit-Filter-Menu', '39-auth-visit-filter-menu.png');
      await page.keyboard.press('Escape');
    }

    // 5. Explore Settings button (`aiux-settings-button`)
    const settingsBtn = await page.$('[data-testid="aiux-settings-button"]');
    if (settingsBtn) {
      await settingsBtn.click();
      await page.waitForTimeout(2500);
      await snapshot('08-Settings-Panel', '40-auth-settings-panel.png');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }

    // 6. Explore Subscribe button (`subscribe-nav-button`)
    const subBtn = await page.$('[data-testid="subscribe-nav-button"]');
    if (subBtn) {
      await subBtn.click();
      await page.waitForTimeout(2500);
      await snapshot('09-Subscribe-Modal-Or-Page', '41-auth-subscribe-plans.png');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }

    // 7. Explore Help Center (`help-center-nav-icon`) & User Profile Menu (`menu-appbar`)
    const userMenuBtn = await page.$('[data-testid="menu-appbar"]');
    if (userMenuBtn) {
      await userMenuBtn.click();
      await page.waitForTimeout(1500);
      await snapshot('10-User-Account-Menu', '42-auth-user-account-menu.png');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }

    await context.storageState({ path: STATE_PATH });
    fs.writeFileSync(path.join(__dirname, 'authenticated-feature-log.json'), JSON.stringify(featureLog, null, 2));
    fs.writeFileSync(path.join(__dirname, 'authenticated-api-captured.json'), JSON.stringify(apiCaptured, null, 2));
    console.log('Saved authenticated-feature-log.json and authenticated-api-captured.json.');
  } finally {
    await browser.close();
  }
}

exploreAllFeatures().catch(err => {
  console.error(err);
  process.exit(1);
});
