import { CardData } from "@/lib/types";

type CardViewProps = {
  card: CardData;
  onDelete?: () => void;
  isDragging?: boolean;
};

export default function CardView({ card, onDelete, isDragging }: CardViewProps) {
  return (
    <div
      className={`group relative rounded-lg border border-black/5 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {onDelete && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${card.title}`}
          className="absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-navy group-hover:flex"
        >
          &times;
        </button>
      )}
      <h3 className="pr-5 text-sm font-semibold text-navy">{card.title}</h3>
      {card.details && <p className="mt-1 text-sm text-muted">{card.details}</p>}
    </div>
  );
}
