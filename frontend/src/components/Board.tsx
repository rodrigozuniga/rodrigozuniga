"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { initialColumns } from "@/lib/dummy-data";
import { CardData, ColumnData } from "@/lib/types";
import Column from "./Column";
import CardView from "./CardView";

function findColumn(columns: ColumnData[], id: string): ColumnData | undefined {
  return columns.find((column) => column.id === id || column.cards.some((card) => card.id === id));
}

export default function Board() {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const column = findColumn(columns, String(event.active.id));
    setActiveCard(column?.cards.find((card) => card.id === event.active.id) ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const sourceColumn = findColumn(columns, activeId);
    const targetColumn = findColumn(columns, overId);
    if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) return;

    setColumns((prev) => {
      const sourceCards = [...sourceColumn.cards];
      const activeIndex = sourceCards.findIndex((card) => card.id === activeId);
      const [movedCard] = sourceCards.splice(activeIndex, 1);

      const targetCards = [...targetColumn.cards];
      const overIndex = targetCards.findIndex((card) => card.id === overId);
      targetCards.splice(overIndex >= 0 ? overIndex : targetCards.length, 0, movedCard);

      return prev.map((column) => {
        if (column.id === sourceColumn.id) return { ...column, cards: sourceCards };
        if (column.id === targetColumn.id) return { ...column, cards: targetCards };
        return column;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const column = findColumn(columns, activeId);
    if (!column || column.id !== findColumn(columns, overId)?.id) return;

    const oldIndex = column.cards.findIndex((card) => card.id === activeId);
    const newIndex = column.cards.findIndex((card) => card.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    setColumns((prev) =>
      prev.map((col) =>
        col.id === column.id ? { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) } : col
      )
    );
  };

  const renameColumn = (columnId: string, title: string) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, title } : col)));
  };

  const addCard = (columnId: string, title: string, details: string) => {
    const newCard: CardData = { id: crypto.randomUUID(), title, details };
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col))
    );
  };

  const deleteCard = (columnId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, cards: col.cards.filter((card) => card.id !== cardId) } : col
      )
    );
  };

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 items-start gap-4 overflow-x-auto p-6">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onRename={(title) => renameColumn(column.id, title)}
            onAddCard={(title, details) => addCard(column.id, title, details)}
            onDeleteCard={(cardId) => deleteCard(column.id, cardId)}
          />
        ))}
      </div>
      <DragOverlay>{activeCard ? <CardView card={activeCard} /> : null}</DragOverlay>
    </DndContext>
  );
}
