import { describe, expect, it } from "vitest";
import { initialColumns } from "./dummy-data";

describe("initialColumns", () => {
  it("has exactly five columns", () => {
    expect(initialColumns).toHaveLength(5);
  });

  it("gives every column and card a unique id", () => {
    const columnIds = initialColumns.map((column) => column.id);
    const cardIds = initialColumns.flatMap((column) => column.cards.map((card) => card.id));

    expect(new Set(columnIds).size).toBe(columnIds.length);
    expect(new Set(cardIds).size).toBe(cardIds.length);
  });

  it("populates every column with at least one dummy card", () => {
    for (const column of initialColumns) {
      expect(column.cards.length).toBeGreaterThan(0);
    }
  });
});
