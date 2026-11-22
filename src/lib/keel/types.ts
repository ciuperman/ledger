export type KeelColumnId = string;

export type KeelCheck = {
  id: string;
  text: string;
  done: boolean;
};

export type KeelCard = {
  id: string;
  columnId: KeelColumnId;
  title: string;
  note?: string;
  doneAt?: string;
  checks?: KeelCheck[];
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
