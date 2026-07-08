import { test, expect, type Page } from "@playwright/test";

const COLUMN_IDS = ["backlog", "todo", "in-progress", "review", "done"];

async function dragCardTo(page: Page, cardTestId: string, targetColumnTestId: string) {
  const card = page.getByTestId(cardTestId);
  const target = page.getByTestId(targetColumnTestId);

  const cardBox = await card.boundingBox();
  const targetBox = await target.boundingBox();
  if (!cardBox || !targetBox) throw new Error("Could not measure drag source or target");

  const startX = cardBox.x + cardBox.width / 2;
  const startY = cardBox.y + cardBox.height / 2;
  const endX = targetBox.x + targetBox.width / 2;
  const endY = targetBox.y + targetBox.height - 20;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 10, startY + 10, { steps: 5 });
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.mouse.move(endX, endY, { steps: 2 });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("loads a single board with five columns populated with dummy data", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Kanban" })).toBeVisible();

  for (const columnId of COLUMN_IDS) {
    const column = page.getByTestId(`column-${columnId}`);
    await expect(column).toBeVisible();
    await expect(column.getByTestId(/^card-/)).not.toHaveCount(0);
  }
});

test("renames a column", async ({ page }) => {
  const column = page.getByTestId("column-backlog");
  await column.getByText("Backlog").click();

  const input = column.locator("input");
  await input.fill("Ideas");
  await input.press("Enter");

  await expect(column.getByText("Ideas")).toBeVisible();
  await expect(page.getByText("Backlog")).toHaveCount(0);
});

test("adds a new card to a column", async ({ page }) => {
  const column = page.getByTestId("column-todo");
  await column.getByText("+ Add a card").click();
  await column.getByPlaceholder("Card title").fill("Review pull requests");
  await column.getByPlaceholder("Details (optional)").fill("Check the open PR queue");
  await column.getByRole("button", { name: "Add card" }).click();

  await expect(column.getByText("Review pull requests")).toBeVisible();
  await expect(column.getByText("Check the open PR queue")).toBeVisible();
});

test("deletes a card", async ({ page }) => {
  const column = page.getByTestId("column-backlog");
  const card = column.getByTestId("card-card-1");
  await expect(card).toBeVisible();

  await card.hover();
  await card.getByRole("button", { name: /Delete/ }).click();

  await expect(card).toHaveCount(0);
});

test("drags a card from one column to another", async ({ page }) => {
  const sourceColumn = page.getByTestId("column-backlog");
  const targetColumn = page.getByTestId("column-todo");

  await expect(sourceColumn.getByTestId("card-card-1")).toBeVisible();
  await expect(targetColumn.getByTestId("card-card-1")).toHaveCount(0);

  await dragCardTo(page, "card-card-1", "column-todo");

  await expect(targetColumn.getByTestId("card-card-1")).toBeVisible();
  await expect(sourceColumn.getByTestId("card-card-1")).toHaveCount(0);
});
