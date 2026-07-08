import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CardView from "./CardView";

const card = { id: "1", title: "Write tests", details: "Cover the board components" };

describe("CardView", () => {
  it("renders the card title and details", () => {
    render(<CardView card={card} />);
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Cover the board components")).toBeInTheDocument();
  });

  it("omits the details paragraph when details is empty", () => {
    render(<CardView card={{ ...card, details: "" }} />);
    expect(screen.queryByText("Cover the board components")).not.toBeInTheDocument();
  });

  it("does not render a delete button when onDelete is not provided", () => {
    render(<CardView card={card} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onDelete when the delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<CardView card={card} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete Write tests" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
