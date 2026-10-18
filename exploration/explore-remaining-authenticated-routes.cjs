const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const STATE_PATH = path.join(__dirname, 'auth-storage-state.json');

async function exploreRemainingAuthenticatedRoutes() {
  const featureLog = [];
  const apiCaptured = [];

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
        bodyText: document.body.innerText.slice(0, 5000),
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
        })).filter(b => b.text || b.ariaLabel || b.testId)
      }));
      featureLog.push({ stepName, fileName, ...dom });
      console.log(`=== [${stepName}] (${dom.url}) ===`);
      console.log('Body Preview:', dom.bodyText.replace(/\n+/g, ' | ').slice(0, 400));
      return dom;
    };

    // 1. Go to /record
    await page.goto('https://secure.getfreed.ai/record', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);

    // Close audio test popup if open
    const closeAudioPopup = await page.$('[data-testid="test-audio-popup-close"]');
    if (closeAudioPopup) {
      await closeAudioPopup.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    // 2. Click Templates in sidenav
    const templatesNav = await page.$('button:has-text("Templates"), [data-testid*="template"]');
    if (templatesNav) {
      await templatesNav.click();
      await page.waitForTimeout(3000);
      await snapshot('11-Templates-Library', '43-auth-templates-library.png');

      // Click on a template card/row to open Template Editor
      const firstTemplate = await page.$('text=Returning Patient, text=New Patient');
      if (firstTemplate) {
        await firstTemplate.click().catch(() => {});
        await page.waitForTimeout(2500);
        await snapshot('12-Template-Editor-Detail', '44-auth-template-editor.png');
      }
    }

    // 3. Click EHR Push in sidenav
    const ehrNav = await page.$('[data-testid="aiux-sidenav-ehr"], button:has-text("EHR Push")');
    if (ehrNav) {
      await ehrNav.click();
      await page.waitForTimeout(2500);
      await snapshot('13-EHR-Push-Page', '45-auth-ehr-push-page.png');
    }

    // 4. Explore all Settings subpages
    await page.goto('https://secure.getfreed.ai/settings/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await snapshot('14-Settings-Profile', '46-auth-settings-profile.png');

    const membersTab = await page.$('[data-testid="settings-nav-item-members"]');
    if (membersTab) {
      await membersTab.click();
      await page.waitForTimeout(2500);
      await snapshot('15-Settings-Members', '47-auth-settings-members.png');
    }

    const invoicesTab = await page.$('[data-testid="settings-nav-item-invoices"]');
    if (invoicesTab) {
      await invoicesTab.click();
      await page.waitForTimeout(2500);
      await snapshot('16-Settings-Subscription', '48-auth-settings-subscription.png');
    }

    const connectionsTab = await page.$('[data-testid="settings-nav-item-connections"]');
    if (connectionsTab) {
      await connectionsTab.click();
      await page.waitForTimeout(2500);
      await snapshot('17-Settings-Connections', '49-auth-settings-connections.png');
    }

    // 5. Return to Visits and inspect the Demo Visit (`John Smith`) and start demo / inspect artifact area
    const backBtn = await page.$('[data-testid="aiux-settings-back-to-app"]');
    if (backBtn) {
      await backBtn.click();
      await page.waitForTimeout(3000);
    } else {
      await page.goto('https://secure.getfreed.ai/visit/c258ee90-3e63-4bae-baef-cbfeed40ec69', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(4000);
    }

    // Select John Smith visit
    const johnVisit = await page.$('[data-testid="visit-item-button"]');
    if (johnVisit) {
      await johnVisit.click();
      await page.waitForTimeout(3000);
      await snapshot('18-John-Smith-Demo-Visit', '50-auth-john-smith-visit.png');

      // Check Template selector dropdown inside visit
      const tmplSelector = await page.$('[data-testid="new-template-selector"]');
      if (tmplSelector) {
        await tmplSelector.click();
        await page.waitForTimeout(1000);
        await snapshot('19-Visit-Template-Dropdown', '51-auth-visit-template-dropdown.png');
        await page.keyboard.press('Escape');
      }

      // Check Pronoun selector
      const pronounBtn = await page.$('[data-testid="aiux-header-pronoun-action"]');
      if (pronounBtn) {
        await pronounBtn.click();
        await page.waitForTimeout(1000);
        await snapshot('20-Visit-Pronoun-Menu', '52-auth-visit-pronoun-menu.png');
        await page.keyboard.press('Escape');
      }

      // Click Capture / Start Demo Visit if button is present
      const captureBtn = await page.$('[data-testid="record-button"]');
      if (captureBtn) {
        await captureBtn.click();
        await page.waitForTimeout(4000);
        await snapshot('21-Active-Recording-State', '53-auth-active-recording.png');

        // Wait a bit more and see if stop/end visit button exists
        const stopBtn = await page.$('button:has-text("End visit"), button:has-text("Stop"), [data-testid*="stop"], [data-testid*="end"]');
        if (stopBtn) {
          await stopBtn.click();
          await page.waitForTimeout(6000);
          await snapshot('22-Post-Recording-Note-State', '54-auth-post-recording.png');
        }
      }
    }

    // 6. Responsive viewports on authenticated workspace (Tablet 768x1024 and Mobile 390x844)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await snapshot('23-Authenticated-Workspace-Tablet', '55-auth-workspace-tablet.png');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(2000);
    await snapshot('24-Authenticated-Workspace-Mobile', '56-auth-workspace-mobile.png');

    await context.storageState({ path: STATE_PATH });
    fs.writeFileSync(path.join(__dirname, 'remaining-auth-log.json'), JSON.stringify(featureLog, null, 2));
    fs.writeFileSync(path.join(__dirname, 'remaining-api-captured.json'), JSON.stringify(apiCaptured, null, 2));
    console.log('Completed remaining authenticated route exploration.');
  } finally {
    await browser.close();
  }
}

exploreRemainingAuthenticatedRoutes().catch(err => {
  console.error(err);
  process.exit(1);
});
