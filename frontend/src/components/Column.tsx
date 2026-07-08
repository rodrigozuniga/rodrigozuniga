"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ColumnData } from "@/lib/types";
import Card from "./Card";
import AddCardForm from "./AddCardForm";

type ColumnProps = {
  column: ColumnData;
  onRename: (title: string) => void;
  onAddCard: (title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export default function Column({ column, onRename, onAddCard, onDeleteCard }: ColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const { setNodeRef } = useDroppable({ id: column.id });

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    onRename(trimmed || column.title);
    setIsEditingTitle(false);
  };

  return (
    <div
      data-testid={`column-${column.id}`}
      className="flex w-72 shrink-0 flex-col rounded-xl border-t-4 border-accent bg-black/[0.03]"
    >
      <div className="px-3 pt-3 pb-2">
        {isEditingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(column.title);
                setIsEditingTitle(false);
              }
            }}
            className="w-full rounded border border-primary/40 bg-white px-2 py-1 text-sm font-semibold text-navy outline-none focus:border-primary"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setTitleDraft(column.title);
              setIsEditingTitle(true);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm font-semibold text-navy hover:bg-black/5"
          >
            <span>{column.title}</span>
            <span className="text-xs font-normal text-muted">{column.cards.length}</span>
          </button>
        )}
      </div>
      <div ref={setNodeRef} className="flex min-h-16 flex-1 flex-col gap-2 px-3 pb-3">
        <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <Card key={card.id} card={card} onDelete={() => onDeleteCard(card.id)} />
          ))}
        </SortableContext>
        <AddCardForm onAdd={onAddCard} />
      </div>
    </div>
  );
}
