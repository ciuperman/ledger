export type KeelColumnId = string;

export type KeelCard = {
  id: string;
  columnId: KeelColumnId;
  title: string;
  note?: string;
  doneAt?: string;
};

export type KeelColumn = {
  id: KeelColumnId;
  title: string;
};

export type KeelSnapshot = {
  v: 1 | 2;
  updatedAt: number;
  columns: KeelColumn[];
  cards: KeelCard[];
};
