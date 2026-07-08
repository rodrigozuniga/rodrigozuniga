"use client";

import { useState, type FormEvent } from "react";

type AddCardFormProps = {
  onAdd: (title: string, details: string) => void;
};

export default function AddCardForm({ onAdd }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const reset = () => {
    setTitle("");
    setDetails("");
    setIsOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onAdd(trimmedTitle, details.trim());
    reset();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-1 rounded-lg px-2 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10"
      >
        + Add a card
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-1 flex flex-col gap-2 rounded-lg bg-white p-3 shadow-sm"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title"
        className="rounded border border-black/10 px-2 py-1 text-sm text-navy outline-none focus:border-primary"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="resize-none rounded border border-black/10 px-2 py-1 text-sm text-navy outline-none focus:border-primary"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-muted hover:text-navy"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
