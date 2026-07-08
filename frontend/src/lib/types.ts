export type CardData = {
  id: string;
  title: string;
  details: string;
};

export type ColumnData = {
  id: string;
  title: string;
  cards: CardData[];
};
