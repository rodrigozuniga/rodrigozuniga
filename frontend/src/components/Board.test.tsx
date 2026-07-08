import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Board from "./Board";
import { initialColumns } from "@/lib/dummy-data";

describe("Board", () => {
  it("renders the five fixed columns populated with dummy data", () => {
    render(<Board />);

    for (const column of initialColumns) {
      expect(screen.getByText(column.title)).toBeInTheDocument();
    }
    expect(screen.getAllByText("+ Add a card")).toHaveLength(initialColumns.length);
  });

  it("adds a new card only to the column it was created in", async () => {
    const user = userEvent.setup();
    render(<Board />);

    const backlogColumn = screen.getByTestId("column-backlog");

    await user.click(within(backlogColumn).getByText("+ Add a card"));
    await user.type(within(backlogColumn).getByPlaceholderText("Card title"), "Plan sprint review");
    await user.click(within(backlogColumn).getByRole("button", { name: "Add card" }));

    expect(within(backlogColumn).getByText("Plan sprint review")).toBeInTheDocument();

    const todoColumn = screen.getByTestId("column-todo");
    expect(within(todoColumn).queryByText("Plan sprint review")).not.toBeInTheDocument();
  });

  it("deletes a card when its delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<Board />);

    const firstCardTitle = initialColumns[0].cards[0].title;
    expect(screen.getByText(firstCardTitle)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: `Delete ${firstCardTitle}` }));

    expect(screen.queryByText(firstCardTitle)).not.toBeInTheDocument();
  });

  it("renames a column", async () => {
    const user = userEvent.setup();
    render(<Board />);

    await user.click(screen.getByText("Backlog"));
    const input = screen.getByDisplayValue("Backlog");
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");

    expect(screen.getByText("Ideas")).toBeInTheDocument();
    expect(screen.queryByText("Backlog")).not.toBeInTheDocument();
  });
});
