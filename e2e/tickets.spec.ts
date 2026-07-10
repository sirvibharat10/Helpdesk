import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from backend/.env file
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

test.describe("Support Email Ticket Ingestion E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@helpdesk.ai");
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
    
    // Click on the ticket Subject link to view detail
    await ticketRow.locator("button.link").click();

    // Verify details are rendered correctly on the Ticket Detail page
    await expect(page).toHaveURL(new RegExp(`/tickets/${ticketId}`));
    await expect(page.locator(`h2:has-text('${testSubject}')`)).toBeVisible();
    await expect(page.locator(`text=${testBody}`)).toBeVisible();
    await expect(page.locator(`text=${testName}`)).toBeVisible();
  });

  test("should successfully create a ticket by hitting the webhook API endpoint directly", async ({ page, request }) => {
    const uniqueId = Date.now();
    const testEmail = `webhook_api_${uniqueId}@example.com`;
    const testName = `Webhook API Sender ${uniqueId}`;
    const testSubject = `Direct Webhook API Ingestion - ${uniqueId}`;
    const testBody = `This ticket is created by hitting the unauthenticated incoming-email webhook endpoint directly via E2E API request. ID: ${uniqueId}`;

    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3001";
    const webhookSecret = process.env.WEBHOOK_SECRET || "";

    // Post to the webhook endpoint directly via configured API_BASE_URL and WEBHOOK_SECRET
    const response = await request.post(`${apiBaseUrl}/api/tickets/incoming-email`, {
      headers: {
        "X-Webhook-Secret": webhookSecret,
      },
      data: {
        fromEmail: testEmail,
        fromName: testName,
        subject: testSubject,
        body: testBody,
      },
    });

    // Check response status and extract ticket ID
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    const json = await response.json();
    expect(json.id).toBeDefined();
    expect(json.source).toBe("EMAIL");

    // Verify the ticket shows up in the user interface (as the logged-in admin)
    await page.goto("/tickets");
    const ticketRow = page.locator(`tr:has-text('${testSubject}')`);
    await expect(ticketRow).toBeVisible();
    await expect(ticketRow).toContainText(testEmail);

    // Click the ticket Subject link to verify the details page
    await ticketRow.locator("button.link").click();
    await expect(page).toHaveURL(new RegExp(`/tickets/${json.id}`));
    await expect(page.locator(`h2:has-text('${testSubject}')`)).toBeVisible();
    await expect(page.locator(`text=${testBody}`)).toBeVisible();
  });
});
