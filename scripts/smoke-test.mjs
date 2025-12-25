import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const baseURL = "http://localhost:3000";
const admin = { email: "admin@gdtfieldnotes.com", password: "admin123" };
const user = { email: "user@gdtfieldnotes.com", password: "user123" };

const imagePath = "/tmp/gdt-smoke.png";
if (!fs.existsSync(imagePath)) {
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
  fs.writeFileSync(imagePath, Buffer.from(pngBase64, "base64"));
}

async function login(page, credentials) {
  await page.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button:has-text("Login")');
  await page.waitForURL("**/editor", { timeout: 10000 });
}

async function waitForUserNotifications(page) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.reload({ waitUntil: "networkidle" });
    const notificationCount = await page.locator('button:has-text("Notifications")').count();
    const actionRequiredCount = await page.locator('text=Action required').count();
    if (notificationCount > 0 || actionRequiredCount > 0) {
      return;
    }
    await page.waitForTimeout(1000);
  }

  throw new Error("User notification banner not visible after admin note.");
}

async function run() {
  const browser = await chromium.launch();

  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();

  await login(userPage, user);
  await userPage.goto(`${baseURL}/editor`, { waitUntil: "networkidle" });
  await userPage.fill('input[name="title"]', "Smoke Test: Coastal Light");
  await userPage.fill('input[name="excerpt"]', "An atmospheric coastal travel note.");
  await userPage.fill('input[name="metaTitle"]', "Coastal Light | GDT Field Notes");
  await userPage.fill(
    'input[name="metaDesc"]',
    "A coastal travel essay featuring mist, tides, and golden hour light."
  );
  await userPage.fill('input[name="tags"]', "Coast, Light, Smoke Test");
  await userPage.fill('input[name="categories"]', "Nature, Culture");

  const headingInput = userPage.locator('input[placeholder="Heading text"]').first();
  await headingInput.fill("Coastal Light");

  await userPage.click('button:has-text("Add Paragraph")');
  const paragraph = userPage.locator('textarea[placeholder="Paragraph text"]').last();
  await paragraph.fill("A short paragraph for the smoke test.");

  await userPage.click('button:has-text("Add Media")');
  const mediaFileInputs = userPage.locator('input[type="file"][name="mediaFiles"]');
  await mediaFileInputs.last().setInputFiles(imagePath);
  const altInputs = userPage.locator('input[placeholder="Alt text for the media"]');
  await altInputs.last().fill("Golden light over the bay");

  await userPage.click('button:has-text("Submit for Review")');
  await userPage.waitForURL("**/editor?submitted=1", { timeout: 10000 });
  await userPage.goto(`${baseURL}/editor`, { waitUntil: "networkidle" });
  await userPage.waitForSelector("text=Your submissions");

  await userPage.goto(baseURL, { waitUntil: "networkidle" });
  await userPage.fill('input[name="email"]', `smoke-${Date.now()}@example.com`);
  await userPage.check('input[name="wantsToPost"]');
  await userPage.click('button:has-text("Subscribe")');
  await userPage.waitForLoadState("networkidle");

  await userPage.goto(`${baseURL}/#partner`, { waitUntil: "networkidle" });
  await userPage.fill('input[name="name"]', "Smoke Vendor");
  await userPage.fill('input[name="email"]', "vendor@example.com");
  await userPage.fill('input[name="company"]', "Vendor Co");
  await userPage.fill('textarea[name="message"]', "Interested in partnership.");
  await userPage.click('button:has-text("Send Interest")');
  await userPage.waitForLoadState("networkidle");

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await login(adminPage, admin);
  await adminPage.goto(`${baseURL}/admin/moderation`, { waitUntil: "networkidle" });

  const targetCard = adminPage.locator("div", {
    has: adminPage.locator("h3", { hasText: "Smoke Test: Coastal Light" }),
  });
  const targetForm = targetCard.locator("form").first();
  await targetForm.locator('select[name="status"]').selectOption("NEEDS_CHANGES");
  await targetForm.locator('textarea[name="note"]').fill("Please expand the intro paragraph.");
  await targetForm.locator('button:has-text("Update Status")').click();
  await adminPage.waitForURL("**/admin/moderation", { timeout: 10000 });

  await waitForUserNotifications(userPage);
  await userPage.goto(`${baseURL}/editor`, { waitUntil: "networkidle" });
  await userPage.waitForSelector("text=Please expand the intro paragraph.");
  await userPage.click('a:has-text(\"Edit and resubmit\")');
  await userPage.waitForURL("**/editor/edit/**", { timeout: 10000 });
  await userPage.fill('textarea[placeholder="Paragraph text"]', "Updated intro with more detail.");
  await userPage.click('button:has-text("Resubmit for Review")');
  await userPage.waitForURL("**/editor?submitted=1", { timeout: 10000 });

  await adminPage.reload({ waitUntil: "networkidle" });
  const approvalCard = adminPage.locator("div", {
    has: adminPage.locator("h3", { hasText: "Smoke Test: Coastal Light" }),
  });
  const approvalForm = approvalCard.locator("form").first();
  await approvalForm.locator('select[name="status"]').selectOption("APPROVED");
  await approvalForm.locator('button:has-text("Update Status")').click();
  await adminPage.waitForURL("**/admin/moderation", { timeout: 10000 });

  await userPage.goto(`${baseURL}/field-notes`, { waitUntil: "networkidle" });
  const essayLink = userPage.locator('a', { hasText: "Smoke Test: Coastal Light" }).first();
  await essayLink.click();
  await userPage.waitForURL("**/essay/**", { timeout: 10000 });
  await userPage.waitForSelector("text=min read");

  await userPage.click('button:has-text("Like")');
  await userPage.fill('textarea[name="text"]', "Loved this short vignette.");
  await userPage.click('button:has-text("Post Comment")');
  await userPage.waitForTimeout(500);
  await userPage.waitForSelector("text=Loved this short vignette.");

  await adminPage.goto(`${baseURL}/admin/layout`, { waitUntil: "networkidle" });
  await adminPage.waitForSelector('button:has-text("Save Layout")');

  await browser.close();
  console.log("Smoke test completed successfully");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
