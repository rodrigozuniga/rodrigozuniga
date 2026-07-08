"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardData } from "@/lib/types";
import CardView from "./CardView";

type CardProps = {
  card: CardData;
  onDelete: () => void;
};

export default function Card({ card, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`card-${card.id}`}
      {...attributes}
      {...listeners}
    >
      <CardView card={card} onDelete={onDelete} isDragging={isDragging} />
    </div>
  );
}
