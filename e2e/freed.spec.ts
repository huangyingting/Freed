import { test, expect } from '@playwright/test';

test.describe('Freed AI Medical Scribe Full-Stack E2E Verification', () => {
  test('Public marketing pages, Clinical Evidence simulator, Pricing toggles, and 404 work', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /Be present with patients/i })
    ).toBeVisible();

    // Test interactive specialty tabs on homepage
    await page.getByRole('button', { name: 'pediatrics' }).click();
    await expect(page.getByText(/Acute Otitis Media/i)).toBeVisible();

    // Navigate to Clinical Evidence page
    await page.goto('/clinical-evidence');
    await expect(
      page.getByRole('heading', {
        name: /Peer-reviewed Clinical Evidence right inside your patient visit/i,
      })
    ).toBeVisible();

    // Navigate to Pricing page and toggle Monthly/Annual
    await page.goto('/pricing');
    await expect(page.getByText('$99')).toBeVisible();
    await page.getByRole('button', { name: 'Monthly Billing' }).click();
    await expect(page.getByText('$119')).toBeVisible();

    // Verify custom 404 page
    await page.goto('/non-existent-clinical-route');
    await expect(
      page.getByRole('heading', { name: /Page doesn't exist/i })
    ).toBeVisible();
  });

  test('Clinician workspace: Record new visit, generate SOAP note, query Clinical Evidence, and Push to EHR', async ({
    page,
  }) => {
    await page.goto('/record');
    await expect(
      page.getByRole('heading', { name: /Capture Patient Visit/i })
    ).toBeVisible();

    // Test Audio / Mic Diagnostics Popup
    await page.getByRole('button', { name: /Test audio/i }).click();
    await expect(page.getByTestId('test-audio-popup')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify Active vs Trash filter toggle in Schedule sidebar
    await page.getByRole('button', { name: /Trash/i }).click();
    await page.getByRole('button', { name: /Active/i }).click();

    // Load Asthma simulation preset and generate SOAP note
    await page.getByRole('button', { name: /Load: Primary Care/i }).click();
    await expect(page.locator('input[placeholder*="Sarah Jenkins"]')).toHaveValue(
      'Elena Rostova'
    );

    await page
      .getByRole('button', { name: /Generate SOAP Note & Codes/i })
      .click();

    await page.waitForURL(/\/visit\/.+/);
    await expect(
      page.getByText(/Subjective \/ History of Present Illness/i)
    ).toBeVisible();

    // Verify Multilingual Patient Instructions translation to Spanish
    await page
      .getByLabel('Patient Instructions Language')
      .selectOption('Spanish');
    await expect(
      page.locator('textarea').nth(3)
    ).toHaveValue(/Gracias por reunirse conmigo hoy/i);

    // Switch to Coding tab and verify ICD-10 extraction + E/M MDM Level card
    await page.getByRole('button', { name: /Coding/i }).click();
    await expect(page.getByText('J45.21')).toBeVisible();
    await expect(
      page.getByText(/Recommended E\/M Medical Decision Making \(MDM\) Level/i)
    ).toBeVisible();

    // Switch to Letter tab and test 3 Letter types (Referral, Excuse, Prior Auth)
    await page.getByRole('button', { name: /Letters/i }).click();
    await page.getByRole('button', { name: /Prior Authorization/i }).click();
    await expect(page.locator('textarea').first()).toHaveValue(
      /PRIOR AUTHORIZATION/i
    );

    // Test 1-Click EHR Push
    await page.getByRole('button', { name: /Push to EHR/i }).click();
    await expect(page.getByText(/Pushed to EHR ✓/i)).toBeVisible();

    // Test Clinical Evidence query in right-hand dock
    await page
      .getByPlaceholder(/Ask a clinical evidence question/i)
      .fill('What does GINA recommend for SMART therapy in asthma?');
    await page.getByRole('button', { name: 'Ask' }).click();
    await expect(
      page.getByText(/Global Initiative for Asthma/i).first()
    ).toBeVisible();
  });

  test('Templates & Dot-Phrases Studio: Teach Freed note style and create /macro phrase', async ({
    page,
  }) => {
    await page.goto('/templates');
    await expect(
      page.getByRole('heading', { name: /Templates & Dot-Phrases Studio/i })
    ).toBeVisible();

    // Switch to Freed Library tab
    await page.getByRole('button', { name: /Freed library/i }).click();
    await expect(page.getByText(/Verified Freed Library/i).first()).toBeVisible();

    // Switch to Phrases tab
    await page.getByRole('button', { name: /Phrases/i }).click();
    await expect(page.getByText('/pe').first()).toBeVisible();
  });

  test('Settings, Connections, and Health Readiness API work end-to-end', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/health');
    expect(healthRes.ok()).toBeTruthy();
    const healthJson = await healthRes.json();
    expect(healthJson.status).toBe('ok');
    expect(healthJson.database).toBe('connected');

    await page.goto('/onboarding-personalization');
    await expect(
      page.getByRole('heading', {
        name: /Tell us about your clinical specialty/i,
      })
    ).toBeVisible();
    await page
      .getByRole('button', { name: /Next: Practice & EHR Setup/i })
      .click();
    await expect(
      page.getByRole('heading', { name: /Tell us about your practice & EHR/i })
    ).toBeVisible();

    await page.goto('/settings/profile');
    await expect(
      page.getByRole('heading', { name: /Clinician Profile & Specialty/i })
    ).toBeVisible();

    await page.goto('/settings/members');
    await expect(
      page.getByRole('heading', { name: /Practice Team & Seat Management/i })
    ).toBeVisible();
  });
});
