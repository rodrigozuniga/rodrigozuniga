import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AddCardForm from "./AddCardForm";

describe("AddCardForm", () => {
  it("shows only the add trigger by default", () => {
    render(<AddCardForm onAdd={vi.fn()} />);
    expect(screen.getByText("+ Add a card")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Card title")).not.toBeInTheDocument();
  });

  it("opens the form and submits a trimmed title and details", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);

    await user.click(screen.getByText("+ Add a card"));
    await user.type(screen.getByPlaceholderText("Card title"), "  New task  ");
    await user.type(screen.getByPlaceholderText("Details (optional)"), "  Some details  ");
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAdd).toHaveBeenCalledWith("New task", "Some details");
    expect(screen.queryByPlaceholderText("Card title")).not.toBeInTheDocument();
  });

  it("does not submit when the title is blank", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddCardForm onAdd={onAdd} />);

    await user.click(screen.getByText("+ Add a card"));
    await user.click(screen.getByRole("button", { name: "Add card" }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("closes and clears the form when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<AddCardForm onAdd={vi.fn()} />);

    await user.click(screen.getByText("+ Add a card"));
    await user.type(screen.getByPlaceholderText("Card title"), "Draft");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByPlaceholderText("Card title")).not.toBeInTheDocument();

    await user.click(screen.getByText("+ Add a card"));
    expect(screen.getByPlaceholderText("Card title")).toHaveValue("");
  });
});
