import { test, expect, type Page } from "./fixtures";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Demo#2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(email.startsWith("student") ? /\/reports$/ : /\/staff$/);
}
async function form(page: Page, confidential = false) {
  await page.goto("/report/new");
  await page.getByLabel("Incident category").selectOption("PHONE_THEFT");
  await page.getByRole("combobox", { name: /^Campus location/ }).selectOption({ label: "Senate Building" });
  const date = new Date(Date.now() - 60000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  await page.getByLabel("When did it happen?").fill(date.toISOString().slice(0, 16));
  await page.getByLabel("Describe the incident").fill("Fictional location browser check: A missing phone was reported near the building entrance.");
  await page.locator('input[name=channel][value=SECURITY]').check();
  if (confidential) await page.getByLabel("Keep this report confidential").check();
}
async function submit(page: Page) {
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByRole("status")).toContainText("Your report has been saved");
  const ref = new URL(page.url()).pathname.split("/").pop()!;
  return { ref, data: await (await page.request.get(`/api/reports/${ref}`)).json() };
}

test("GPS capture persists with accuracy, maps load on request, and editing removes the point", async ({ browser }) => {
  const context = await browser.newContext({ permissions: ["geolocation"], geolocation: { latitude: 7.51825, longitude: 4.52588, accuracy: 15 } });
  await context.route("https://www.openstreetmap.org/**", (route) => route.fulfill({ contentType: "text/html", body: "<p>Map provider fixture</p>" }));
  try {
    const page = await context.newPage();
    await login(page, "student1@demo.test");
    await form(page);
    await page.getByRole("button", { name: "Use my current location" }).click();
    await expect(page.getByLabel("Latitude", { exact: true })).toHaveValue("7.51825");
    await expect(page.getByText("Current position attached.", { exact: false })).toBeVisible();
    const saved = await submit(page);
    expect(saved.data.coordinates).toEqual({ latitude: 7.51825, longitude: 4.52588, accuracy: 15 });
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("button", { name: "Load map", exact: true }).click();
    await expect(page.getByTitle("Incident location on OpenStreetMap")).toHaveAttribute("src", /marker=7.51825%2C4.52588/);
    await page.getByRole("link", { name: "Edit report", exact: true }).click();
    await expect(page.getByLabel("Latitude", { exact: true })).toHaveValue("7.51825");
    await page.getByRole("button", { name: "Remove coordinates" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(new RegExp(`/reports/${saved.ref}$`));
    expect((await (await page.request.get(`/api/reports/${saved.ref}`)).json()).coordinates).toBeNull();
  } finally { await context.close(); }
});

test("denied permission still allows reporting and partial coordinates are rejected", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", { value: {
      getCurrentPosition: (_success: unknown, failure: (error: { code: number }) => void) => failure({ code: 1 }),
    } });
  });
  await login(page, "student1@demo.test");
  await form(page);
  await page.getByRole("button", { name: "Use my current location" }).click();
  await expect(page.getByText("Location permission was denied.", { exact: false })).toBeVisible();
  await page.getByLabel("Latitude", { exact: true }).fill("7.51825");
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByLabel("Longitude", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Remove coordinates" }).click();
  const saved = await submit(page);
  expect(saved.data.coordinates).toBeNull();
});

test("all staff roles have responsive insights; confidential points and other channels stay restricted", async ({ browser }, testInfo) => {
  const studentContext = await browser.newContext();
  try {
    const student = await studentContext.newPage();
    await login(student, "student1@demo.test");
    await form(student);
    await student.getByLabel("Latitude", { exact: true }).fill("7.51825");
    await student.getByLabel("Longitude", { exact: true }).fill("4.52588");
    const visible = await submit(student);
    await form(student, true);
    await student.getByLabel("Latitude", { exact: true }).fill("7.51937");
    await student.getByLabel("Longitude", { exact: true }).fill("4.52699");
    const confidential = await submit(student);
    for (const [email, heading] of [
      ["committee1@demo.test", "Committee dashboard"],
      ["security1@demo.test", "Security dashboard"],
      ["supervisor@demo.test", "Supervisor dashboard"],
    ]) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        await login(page, email);
        await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Insights & map" }).click();
        await expect(page.getByRole("heading", { name: "Channel insights" })).toBeVisible();
        const payload = await (await page.request.get(`/api/reports/${confidential.ref}`)).json();
        if (email.startsWith("committee")) {
          expect((await page.request.get(`/api/reports/${visible.ref}`)).status()).toBe(404);
          await expect(page.getByText("No accessible report coordinates", { exact: false })).toBeVisible();
        } else {
          await expect(page.getByLabel("Report to locate")).toContainText(visible.ref);
          if (email.startsWith("security")) {
            expect(payload).not.toHaveProperty("coordinates");
            await expect(page.getByLabel("Report to locate")).not.toContainText(confidential.ref);
          } else {
            expect(payload.coordinates.latitude).toBe(7.51937);
            await page.getByLabel("Report to locate").selectOption(confidential.ref);
            await expect(page.getByText("7.519370, 4.526990")).toBeVisible();
          }
        }
        for (const width of [390, 1280]) {
          await page.setViewportSize({ width, height: 844 });
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
          if (email.startsWith("supervisor")) await page.screenshot({ path: testInfo.outputPath(`supervisor-${width}.png`), fullPage: true });
        }
        await page.getByRole("button", { name: "Report queue", exact: true }).click();
        if (!email.startsWith("committee")) await expect(page.getByText(visible.ref, { exact: true })).toBeVisible();
      } finally { await context.close(); }
    }
  } finally { await studentContext.close(); }
});
