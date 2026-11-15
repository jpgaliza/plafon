import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const E2E_EMAIL = process.env.E2E_USER_EMAIL || "e2e@plafon.test";
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD || "PlafonTest123!";

async function resetE2EUserState() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
  });

  if (error || !data.user) return;

  const userId = data.user.id;
  await supabase.from("groups").delete().eq("user_id", userId);
  await supabase.from("transactions").delete().eq("user_id", userId);
  await supabase.from("subscriptions").delete().eq("user_id", userId);
  await supabase
    .from("profiles")
    .update({
      monthly_budget: 0,
      locale: "pt-BR",
      currency: "BRL",
      theme: "dark",
    })
    .eq("id", userId);
  await supabase.auth.signOut({ scope: "local" });
}

async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(E2E_EMAIL);
  await page.locator('input[name="password"]').fill(E2E_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 30_000 });
}

async function navigateTo(
  page: Page,
  route: "/dashboard" | "/transactions" | "/groups" | "/subscriptions" | "/settings",
  isMobile: boolean
) {
  if (route === "/settings") {
    if (isMobile) {
      await page.getByTestId("mobile-settings-link").click();
    } else {
      await page.locator('aside a[href="/settings"]').click();
    }
  } else if (isMobile) {
    if (route === "/dashboard") {
      await page.evaluate(() => {
        document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
      });
    }
    await page.locator(`nav.fixed a[href="${route}"]`).click();
  } else {
    await page.locator(`aside a[href="${route}"]`).click();
  }
  await page.waitForURL(`**${route}`, { timeout: 20_000 });
}

async function deleteTransactionByDescription(page: Page, description: string) {
  const row = page
    .locator('[data-testid^="transaction-row-"]')
    .filter({ hasText: description })
    .first();
  if ((await row.count()) === 0) return;

  await row.getByRole("button", { name: "Excluir transação" }).click();
  await row.getByRole("button", { name: "Confirmar" }).click();
  await expect(
    page
      .locator('[data-testid^="transaction-row-"]')
      .filter({ hasText: description })
  ).toHaveCount(0);
}

test.describe("Plafon End-to-End", () => {
  test.beforeAll(async () => {
    await resetE2EUserState();
  });

  test.afterAll(async () => {
    await resetE2EUserState();
  });

  test("disposable user registration, logout, and test user login", async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name === "mobile";
    const uniqueEmail = `e2e-reg-${Date.now()}-${testInfo.project.name}@plafon.test`;

    await page.goto("/register");
    await page.locator('input[name="name"]').fill("E2E Disposable");
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill("TempPass123!");
    await page.locator('input[name="confirmPassword"]').fill("TempPass123!");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/dashboard", { timeout: 30_000 });

    await navigateTo(page, "/settings", isMobile);
    await page.getByRole("button", { name: /Sair da conta/i }).click();
    await page.waitForURL("**/login", { timeout: 20_000 });

    await loginAsTestUser(page);
    await expect(page.getByTestId("dashboard-balance")).toBeVisible();
  });

  test("spending ceiling, transaction CRUD, and dashboard reflection", async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name === "mobile";
    await loginAsTestUser(page);

    // Set spending ceiling in Settings
    await navigateTo(page, "/settings", isMobile);
    await page.getByTestId("monthly-budget-input").fill("2000");
    await page.getByTestId("monthly-budget-save").click();
    await expect(page.getByTestId("monthly-budget-saved")).toBeVisible();

    await navigateTo(page, "/dashboard", isMobile);
    await expect(page.getByTestId("dashboard-ceiling-remaining")).toContainText(
      "2.000,00"
    );

    // Create transaction
    await navigateTo(page, "/transactions", isMobile);
    await page
      .getByRole("main")
      .getByRole("button", { name: "Nova Transação" })
      .click();

    const txDialog = page.getByRole("dialog");
    await expect(txDialog).toBeVisible();
    await txDialog.locator('input[inputmode="decimal"]').fill("250");
    await txDialog
      .locator('input[placeholder*="Mercado"]')
      .fill("Mercado E2E");
    await txDialog.getByRole("button", { name: "Adicionar transação" }).click();
    await expect(txDialog).toBeHidden();

    const createdRow = page
      .locator('[data-testid^="transaction-row-"]')
      .filter({ hasText: "Mercado E2E" })
      .first();
    await expect(createdRow).toContainText("250,00");

    // Verify reflection on Dashboard
    await navigateTo(page, "/dashboard", isMobile);
    await expect(page.getByTestId("dashboard-expenses")).toContainText("250,00");
    await expect(page.getByTestId("dashboard-ceiling-remaining")).toContainText(
      "1.750,00"
    );

    // Edit transaction
    await navigateTo(page, "/transactions", isMobile);
    await createdRow.getByRole("button", { name: "Editar transação" }).click();
    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();
    await editDialog.locator('input[inputmode="decimal"]').fill("300");
    await editDialog
      .locator('input[placeholder*="Mercado"]')
      .fill("Mercado Editado");
    await editDialog.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(editDialog).toBeHidden();

    await expect(
      page
        .locator('[data-testid^="transaction-row-"]')
        .filter({ hasText: "Mercado Editado" })
        .first()
    ).toContainText("300,00");

    // Delete transaction
    await deleteTransactionByDescription(page, "Mercado Editado");

    // Reset ceiling back to 0 and verify cleanup
    await navigateTo(page, "/dashboard", isMobile);
    await expect(page.getByTestId("dashboard-expenses")).toContainText("0,00");

    await navigateTo(page, "/settings", isMobile);
    await page.getByTestId("monthly-budget-input").fill("0");
    await page.getByTestId("monthly-budget-save").click();
    await expect(page.getByTestId("monthly-budget-saved")).toBeVisible();
  });

  test("subscriptions create, pause/reactivate, and delete", async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name === "mobile";
    await loginAsTestUser(page);

    await navigateTo(page, "/subscriptions", isMobile);
    await page
      .getByRole("main")
      .getByRole("button", { name: /Nova Assinatura/i })
      .click();

    const subDialog = page.getByRole("dialog");
    await expect(subDialog).toBeVisible();
    await subDialog
      .locator('input[placeholder*="Netflix"]')
      .fill("Assinatura E2E");
    await subDialog.locator('input[inputmode="decimal"]').fill("49,90");
    await subDialog.getByRole("button", { name: "Cadastrar Assinatura" }).click();
    await expect(subDialog).toBeHidden();

    const subCard = page
      .locator('[data-testid^="subscription-card-"]')
      .filter({ hasText: "Assinatura E2E" })
      .first();
    await expect(subCard).toBeVisible();
    await expect(page.getByTestId("subscriptions-monthly-total")).toContainText(
      "49,90"
    );

    // Pause subscription
    await subCard.getByRole("button", { name: "Pausar assinatura" }).click();
    await expect(subCard.getByText("Pausada")).toBeVisible();
    await expect(page.getByTestId("subscriptions-monthly-total")).toContainText(
      "0,00"
    );

    // Delete subscription
    await subCard.getByRole("button", { name: "Excluir assinatura" }).click();
    await expect(
      page
        .locator('[data-testid^="subscription-card-"]')
        .filter({ hasText: "Assinatura E2E" })
    ).toHaveCount(0);
  });

  test("groups workflow: create, multi-group tx, existing tx, conditional totals, remove, and delete", async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name === "mobile";
    await loginAsTestUser(page);

    // Create two groups: "Viagem França" and "PlayStation 5"
    await navigateTo(page, "/groups", isMobile);

    await page.getByTestId("new-group-button").click();
    await page.locator("#group-name-input").fill("Viagem França");
    await page.getByTestId("group-drawer-submit").click();
    await expect(
      page.getByRole("link", { name: /Viagem França/i }).first()
    ).toBeVisible();

    await page.getByTestId("new-group-button").click();
    await page.locator("#group-name-input").fill("PlayStation 5");
    await page.getByTestId("group-drawer-submit").click();
    await expect(
      page.getByRole("link", { name: /PlayStation 5/i }).first()
    ).toBeVisible();

    // Create 1 transaction inside BOTH groups, plus 1 loose expense and 1 loose income
    await navigateTo(page, "/transactions", isMobile);

    await page
      .getByRole("main")
      .getByRole("button", { name: "Nova Transação" })
      .click();
    const txDialog1 = page.getByRole("dialog");
    await txDialog1.locator('input[inputmode="decimal"]').fill("500");
    await txDialog1
      .locator('input[placeholder*="Mercado"]')
      .fill("Passagem Dual");
    await txDialog1.getByRole("button", { name: "Viagem França" }).click();
    await txDialog1.getByRole("button", { name: "PlayStation 5" }).click();
    await txDialog1.getByRole("button", { name: "Adicionar transação" }).click();
    await expect(txDialog1).toBeHidden();

    await page
      .getByRole("main")
      .getByRole("button", { name: "Nova Transação" })
      .click();
    const txDialog2 = page.getByRole("dialog");
    await txDialog2.locator('input[inputmode="decimal"]').fill("100");
    await txDialog2
      .locator('input[placeholder*="Mercado"]')
      .fill("Jantar Avulso");
    await txDialog2.getByRole("button", { name: "Adicionar transação" }).click();
    await expect(txDialog2).toBeHidden();

    await page
      .getByRole("main")
      .getByRole("button", { name: "Nova Transação" })
      .click();
    const txDialog3 = page.getByRole("dialog");
    await txDialog3.getByRole("button", { name: "Receita" }).click();
    await txDialog3.locator('input[inputmode="decimal"]').fill("200");
    await txDialog3
      .locator('input[placeholder*="Mercado"]')
      .fill("Reembolso Viagem");
    await txDialog3.getByRole("button", { name: "Adicionar transação" }).click();
    await expect(txDialog3).toBeHidden();

    // Open "Viagem França" group detail
    await navigateTo(page, "/groups", isMobile);
    await page.getByRole("link", { name: /Viagem França/i }).first().click();
    await page.waitForURL("**/groups/*", { timeout: 20_000 });

    // Without income: ONLY "Total gasto" should be visible
    await expect(page.getByTestId("group-total-spent")).toContainText("500,00");
    await expect(page.getByTestId("group-total-received")).toHaveCount(0);
    await expect(page.getByTestId("group-balance")).toHaveCount(0);

    // Add existing expense "Jantar Avulso"
    await page.getByTestId("add-existing-tx-button").click();
    const addDialog = page.getByRole("dialog");
    await addDialog
      .locator('[data-testid^="select-existing-tx-"]')
      .filter({ hasText: "Jantar Avulso" })
      .first()
      .click();
    await addDialog.getByTestId("confirm-add-existing-tx").click();
    await expect(addDialog).toBeHidden();

    await expect(page.getByTestId("group-total-spent")).toContainText("600,00");
    await expect(page.getByTestId("group-total-received")).toHaveCount(0);

    // Add existing income "Reembolso Viagem" -> "Total recebido" and "Saldo" appear
    await page.getByTestId("add-existing-tx-button").click();
    const addIncomeDialog = page.getByRole("dialog");
    await addIncomeDialog
      .locator('[data-testid^="select-existing-tx-"]')
      .filter({ hasText: "Reembolso Viagem" })
      .first()
      .click();
    await addIncomeDialog.getByTestId("confirm-add-existing-tx").click();
    await expect(addIncomeDialog).toBeHidden();

    await expect(page.getByTestId("group-total-received")).toBeVisible();
    await expect(page.getByTestId("group-total-received")).toContainText(
      "200,00"
    );
    await expect(page.getByTestId("group-balance")).toBeVisible();
    await expect(page.getByTestId("group-balance")).toContainText("400,00");

    // Remove "Jantar Avulso" from group without deleting it
    const jantarRow = page
      .locator('[data-testid^="transaction-row-"]')
      .filter({ hasText: "Jantar Avulso" })
      .first();
    await jantarRow.getByRole("button", { name: "Remover do grupo" }).click();
    await expect(
      page
        .locator('[data-testid^="transaction-row-"]')
        .filter({ hasText: "Jantar Avulso" })
    ).toHaveCount(0);
    await expect(page.getByTestId("group-total-spent")).toContainText("500,00");

    // Check "PlayStation 5" also has Passagem Dual (2 groups on 1 tx)
    await navigateTo(page, "/groups", isMobile);
    await page.getByRole("link", { name: /PlayStation 5/i }).first().click();
    await page.waitForURL("**/groups/*", { timeout: 20_000 });
    await expect(
      page
        .locator('[data-testid^="transaction-row-"]')
        .filter({ hasText: "Passagem Dual" })
        .first()
    ).toBeVisible();

    // Delete both groups from /groups
    await navigateTo(page, "/groups", isMobile);
    for (const groupName of ["Viagem França", "PlayStation 5"]) {
      const card = page
        .locator("div.rounded-2xl")
        .filter({ hasText: groupName })
        .first();
      await card.locator('[data-testid^="delete-group-"]').click();
      await card.locator('[data-testid^="confirm-delete-group-"]').click();
      await expect(
        page.getByRole("link", { name: new RegExp(groupName, "i") })
      ).toHaveCount(0);
    }

    // Verify all 3 transactions still exist in /transactions, then clean them up
    await navigateTo(page, "/transactions", isMobile);
    await expect(
      page
        .locator('[data-testid^="transaction-row-"]')
        .filter({ hasText: "Passagem Dual" })
        .first()
    ).toBeVisible();
    await expect(
      page
        .locator('[data-testid^="transaction-row-"]')
        .filter({ hasText: "Jantar Avulso" })
        .first()
    ).toBeVisible();
    await expect(
      page
        .locator('[data-testid^="transaction-row-"]')
        .filter({ hasText: "Reembolso Viagem" })
        .first()
    ).toBeVisible();

    await deleteTransactionByDescription(page, "Passagem Dual");
    await deleteTransactionByDescription(page, "Jantar Avulso");
    await deleteTransactionByDescription(page, "Reembolso Viagem");
  });
});
