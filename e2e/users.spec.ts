import { test, expect } from "@playwright/test";

test.describe("User Management CRUD E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login as Admin
    await page.goto("/login");

    // Fill credentials
    await page.fill('input[type="email"]', "admin@sahayak.ai");
    await page.fill('input[type="password"]', "admin123");

    // Click Login
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard/home page
    await expect(page).toHaveURL("/dashboard");
  });

  test("should successfully perform CRUD operations for user management", async ({ page }) => {
    // Navigate to Users page
    await page.goto("/users");
    await expect(page.locator("h3:has-text('User Management')")).toBeVisible();

    const uniqueId = Date.now();
    const testName = `E2E Agent ${uniqueId}`;
    const testEmail = `e2e_agent_${uniqueId}@sahayak.ai`;
    const updatedName = `E2E Agent Updated ${uniqueId}`;

    // --- CREATE ---
    // Click "Add User" button
    await page.click("button:has-text('Add User')");
    await expect(page.locator("h2:has-text('Add New User')")).toBeVisible();

    // Fill form fields
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "password123");

    // Submit form
    await page.click("button:has-text('Create User')");

    // Verify modal closes and new user appears in list
    await expect(page.locator("h2:has-text('Add New User')")).toBeHidden();
    await expect(page.locator(`text=${testName}`)).toBeVisible();
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();

    // --- UPDATE ---
    // Locate the Edit button for our test user by aria-label
    const editButton = page.locator(`button[aria-label="Edit ${testName}"]`);
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Verify Edit Modal is visible and populated
    await expect(page.locator("h2:has-text('Edit User Profile')")).toBeVisible();
    await expect(page.locator('form input[name="name"]')).toHaveValue(testName);
    await expect(page.locator('form input[name="email"]')).toHaveValue(testEmail);

    // Edit the name field
    await page.fill('form input[name="name"]', updatedName);

    // Submit changes
    await page.click("button:has-text('Save Changes')");

    // Verify Edit Modal closes and name is updated in the list
    await expect(page.locator("h2:has-text('Edit User Profile')")).toBeHidden();
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
    await expect(page.locator(`text=${testName}`)).toBeHidden();

    // --- DELETE ---
    // Locate the Delete button for the updated user by aria-label
    const deleteButton = page.locator(`button[aria-label="Delete ${updatedName}"]`);
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify Delete confirmation modal opens
    await expect(page.locator("h2:has-text('Confirm User Deletion')")).toBeVisible();

    // Click "Delete User" to confirm
    await page.click("button:has-text('Delete User')");

    // Verify confirmation modal closes and user is removed from list
    await expect(page.locator("h2:has-text('Confirm User Deletion')")).toBeHidden();
    await expect(page.locator(`text=${updatedName}`)).toBeHidden();
  });
});
