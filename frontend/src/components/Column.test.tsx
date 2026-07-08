import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Column from "./Column";
import { ColumnData } from "@/lib/types";

const column: ColumnData = {
  id: "todo",
  title: "To Do",
  cards: [
    { id: "1", title: "First card", details: "Details one" },
    { id: "2", title: "Second card", details: "Details two" },
  ],
};

describe("Column", () => {
  it("renders the column title and its cards", () => {
    render(
      <Column column={column} onRename={vi.fn()} onAddCard={vi.fn()} onDeleteCard={vi.fn()} />
    );

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("First card")).toBeInTheDocument();
    expect(screen.getByText("Second card")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renames the column when the title is edited and confirmed", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(
      <Column column={column} onRename={onRename} onAddCard={vi.fn()} onDeleteCard={vi.fn()} />
    );

    await user.click(screen.getByText("To Do"));
    const input = screen.getByDisplayValue("To Do");
    await user.clear(input);
    await user.type(input, "In Review{Enter}");

    expect(onRename).toHaveBeenCalledWith("In Review");
  });

  it("reverts the title without renaming when editing is cancelled", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(
      <Column column={column} onRename={onRename} onAddCard={vi.fn()} onDeleteCard={vi.fn()} />
    );

    await user.click(screen.getByText("To Do"));
    const input = screen.getByDisplayValue("To Do");
    await user.type(input, " Extra{Escape}");

    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("calls onDeleteCard with the right card id", async () => {
    const user = userEvent.setup();
    const onDeleteCard = vi.fn();
    render(
      <Column column={column} onRename={vi.fn()} onAddCard={vi.fn()} onDeleteCard={onDeleteCard} />
    );

    await user.click(screen.getByRole("button", { name: "Delete First card" }));

    expect(onDeleteCard).toHaveBeenCalledWith("1");
  });

  it("calls onAddCard with the values entered in the add card form", async () => {
    const user = userEvent.setup();
    const onAddCard = vi.fn();
    render(
      <Column column={column} onRename={vi.fn()} onAddCard={onAddCard} onDeleteCard={vi.fn()} />
    );

    await user.click(screen.getByText("+ Add a card"));
    await user.type(screen.getByPlaceholderText("Card title"), "Third card");
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAddCard).toHaveBeenCalledWith("Third card", "");
  });
});
