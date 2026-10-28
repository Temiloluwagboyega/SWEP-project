import { test, expect, type Page } from "./fixtures";
async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Demo#2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(
    email.startsWith("student") ? /\/reports$/ : /\/staff$/,
  );
}
async function makeReport(
  page: Page,
  channel: "COMMITTEE" | "SECURITY",
  confidential = false,
) {
  await page.goto("/report/new");
  await page
    .getByLabel("Incident category")
    .selectOption(confidential ? "ASSAULT" : "PHONE_THEFT");
  await page
    .getByRole("combobox", { name: /^Campus location/ })
    .selectOption({ label: "Senate Building" });
  const local = new Date(Date.now() - 3600000);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  await page
    .getByLabel("When did it happen?")
    .fill(local.toISOString().slice(0, 16));
  await page
    .getByLabel("Describe the incident")
    .fill(
      "Fictional browser test: An incident was observed near the building entrance. Please review this demonstration report.",
    );
  await page.locator(`input[name=channel][value=${channel}]`).check();
  if (confidential) {
    await expect(
      page.getByLabel("Keep this report confidential"),
    ).toBeChecked();
    await page.getByLabel("This is happening now").check();
    await expect(page.getByRole("region", { name: "Urgency & privacy" }).getByRole("alert")).toContainText(
      "Don’t wait for the app",
    );
  }
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Your report has been saved",
  );
  const ref = new URL(page.url()).pathname.split("/").pop()!;
  const response = await page.request.get(`/api/reports/${ref}`);
  expect(response.status()).toBe(200);
  return { ref, detail: await response.json() };
}

test("student, committee and security complete the report-and-track loop with privacy enforced", async ({
  browser,
}) => {
  // This flow includes a 30-second poll and many online database round trips.
  test.setTimeout(240000);
  const studentContext = await browser.newContext(),
    committeeContext = await browser.newContext(),
    securityContext = await browser.newContext();
  try {
    const student = await studentContext.newPage(),
      committee = await committeeContext.newPage(),
      security = await securityContext.newPage();
    await login(student, "student1@demo.test");
    await login(committee, "committee1@demo.test");
    await login(security, "security1@demo.test");
    const theft = await makeReport(student, "COMMITTEE");
    // Queue polling is exercised without a manual navigation/refresh.
    await expect(committee.getByText(theft.ref, { exact: true })).toBeVisible({
      timeout: 40000,
    });
    await expect(
      committee.getByRole("row").filter({ hasText: theft.ref }),
    ).toContainText("New");
    const assault = await makeReport(student, "SECURITY", true);
    const denied = await committee.request.get(
      `/api/reports/${assault.detail.id}`,
    );
    expect(denied.status()).toBe(404);
    const restricted = await security.request.get(
      `/api/reports/${assault.detail.id}`,
    );
    expect(restricted.status()).toBe(200);
    expect(Object.keys(await restricted.json()).sort()).toEqual(
      ["ref", "category", "status", "urgent", "createdAt"].sort(),
    );
    await committee.goto(`/staff/reports/${theft.detail.id}`);
    await committee.getByLabel("Next status").selectOption("UNDER_REVIEW");
    await committee.getByRole("button", { name: "Update status" }).click();
    await expect(
      committee.getByRole("button", { name: "Assign handler" }),
    ).toBeVisible();
    await committee.getByRole("button", { name: "Assign handler" }).click();
    await expect(committee.getByLabel("Next status")).toContainText(
      "In progress",
    );
    await committee
      .getByLabel("Referral reason")
      .fill("Fictional test: official follow-up is needed.");
    await committee
      .getByRole("button", { name: "Refer report", exact: true })
      .click();
    await expect(committee).toHaveURL(/\/staff$/);
    expect(
      (await committee.request.get(`/api/reports/${theft.detail.id}`)).status(),
    ).toBe(404);
    await security.goto(`/staff/reports/${theft.detail.id}`);
    await security.getByLabel("Next status").selectOption("UNDER_REVIEW");
    await security.getByRole("button", { name: "Update status" }).click();
    await security.getByRole("button", { name: "Assign handler" }).click();
    await expect(security.getByLabel("Next status")).toContainText(
      "In progress",
    );
    await security.getByLabel("Next status").selectOption("IN_PROGRESS");
    await security.getByLabel("Internal note").fill("BROWSER_PRIVATE_NOTE");
    await security.getByRole("button", { name: "Update status" }).click();
    await expect(security.getByLabel("Next status")).toContainText("Resolved");
    await security.getByLabel("Next status").selectOption("RESOLVED");
    await security
      .getByLabel("Public update")
      .fill("Fictional case reviewed and resolved.");
    await security.getByRole("button", { name: "Update status" }).click();
    await expect(security.locator(".detail-badges .status-badge")).toHaveText("Resolved");
    await student.goto(`/reports/${theft.ref}`);
    await expect(student.locator(".detail-badges .status-badge")).toHaveText("Resolved");
    await expect(
      student.getByText("Fictional case reviewed and resolved."),
    ).toBeVisible();
    const studentPayload = JSON.stringify(
      await (
        await student.request.get(`/api/reports/${theft.detail.id}`)
      ).json(),
    );
    expect(studentPayload).not.toContain("BROWSER_PRIVATE_NOTE");
    expect(studentPayload).not.toContain("internalNote");
    expect(studentPayload).not.toContain("Demo Security One");
    await expect(
      student.getByRole("link", { name: "Edit report" }),
    ).toHaveCount(0);
    const otherContext = await browser.newContext();
    try {
      const other = await otherContext.newPage();
      await login(other, "student2@demo.test");
      expect(
        (await other.request.get(`/api/reports/${theft.detail.id}`)).status(),
      ).toBe(404);
    } finally {
      await otherContext.close();
    }
  } finally {
    await studentContext.close();
    await committeeContext.close();
    await securityContext.close();
  }
});

test("registration creates a student and form validation blocks empty reports", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Fictional Browser Student");
  await page
    .getByLabel("Email address")
    .fill(`browser-${Date.now()}@demo.test`);
  await page.getByLabel("Password", { exact: true }).fill("Eight#26");
  await page.getByRole("button", { name: "Create student account" }).click();
  await expect(page).toHaveURL(/\/reports$/);
  await page.goto("/report/new");
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(
    page.locator("#category-error"),
  ).toBeVisible();
  await expect(
    page.locator("#description-error"),
  ).toBeVisible();
  expect((await page.request.get("/api/staff/users")).status()).toBe(404);
  const crossOrigin = await page.request.post("/api/reports", {
    headers: { origin: "https://untrusted.example" },
    data: {},
  });
  expect(crossOrigin.status()).toBe(400);
});

test("public pages and signed-in form fit mobile and desktop without horizontal scrolling", async ({
  page,
}) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/", "/contacts", "/login", "/register"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await expect(
        page.getByText("In danger now?", { exact: true }),
      ).toBeVisible();
    }
  }
  await login(page, "student1@demo.test");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/report/new");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/contacts");
  for (const number of ["09034592436", "09070367707", "09070367711", "112"])
    await expect(page.locator(`a[href="tel:${number}"]`).last()).toBeVisible();
  await expect(page.getByText("VERIFY_BEFORE_DEMO")).toHaveCount(0);
  await expect(page.locator(".notice").getByText("Contact security personnel near you", { exact: false })).toBeVisible();
});

test("page CSP nonces change between responses and the password control hydrates", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /Content Security Policy|violates.*directive/i.test(message.text())
    )
      violations.push(message.text());
  });
  const first = await page.goto("/login");
  const policy = first!.headers()["content-security-policy"];
  expect(policy).toContain("strict-dynamic");
  const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  expect(
    await page
      .locator("script[nonce]")
      .first()
      .evaluate((script: HTMLScriptElement) => script.nonce),
  ).toBe(nonce);
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  const second = await page.goto("/login");
  expect(
    second!.headers()["content-security-policy"].match(/'nonce-([^']+)'/)?.[1],
  ).not.toBe(nonce);
  expect(violations).toEqual([]);
});
