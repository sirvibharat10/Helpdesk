import { test, expect } from "@playwright/test";

test.describe("Support Email Ticket Ingestion E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@sahayak.ai");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("should successfully ingest a support email and convert it to a ticket", async ({ page }) => {
    // Navigate to Email Setup page
    await page.goto("/email-setup");
    await expect(page.locator("h2:has-text('Simulate Support Email Ingestion')")).toBeVisible();

    const uniqueId = Date.now();
    const testEmail = `customer_${uniqueId}@example.com`;
    const testName = `Jane Customer ${uniqueId}`;
    const testSubject = `Ingestion E2E Ticket - ${uniqueId}`;
    const testBody = `This is a test email sent to the support desk address to verify auto-creation and AI classification. Reference number: ${uniqueId}`;

    // Fill out the simulation form
    await page.fill('input[placeholder="sender@example.com"]', testEmail);
    await page.fill('input[placeholder="Jane Customer"]', testName);
    await page.fill('input[placeholder="Refund request for order #1092"]', testSubject);
    await page.fill('textarea[placeholder="Explain the support issue..."]', testBody);

    // Click submit and wait for ingestion success response
    await page.click("button:has-text('Send Simulated Support Email')");

    // Verify success banner is displayed
    const successBanner = page.locator("div.bg-emerald-50");
    await expect(successBanner).toBeVisible({ timeout: 15000 }); // Wait for Gemini AI classification
    await expect(successBanner).toContainText("Success! Simulated email processed.");

    // Extract created ticket details from banner text
    const bannerText = await successBanner.textContent() || "";
    const ticketIdMatch = bannerText.match(/Ticket #([a-zA-Z0-9_-]+)/);
    expect(ticketIdMatch).not.toBeNull();
    const ticketId = ticketIdMatch![1];

    // Navigate to Tickets page
    await page.goto("/tickets");

    // Verify the newly created ticket is visible in the list with the correct details
    const ticketRow = page.locator(`tr:has-text('${testSubject}')`);
    await expect(ticketRow).toBeVisible();
    await expect(ticketRow).toContainText(testEmail);
    
    // Click on the ticket row to view detail
    await ticketRow.click();

    // Verify details are rendered correctly on the Ticket Detail page
    await expect(page).toHaveURL(new RegExp(`/tickets/${ticketId}`));
    await expect(page.locator(`h2:has-text('${testSubject}')`)).toBeVisible();
    await expect(page.locator(`text=${testBody}`)).toBeVisible();
    await expect(page.locator(`text=${testName}`)).toBeVisible();
  });
});
