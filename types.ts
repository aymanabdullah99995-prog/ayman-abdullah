
export enum Priority {
  NORMAL = 'عادي',
  IMPORTANT = 'مهم',
  URGENT = 'عاجل'
}

export interface LinkEntry {
  id: string;
  url: string;
  title: string;
  category: string;
  priority: Priority;
  note?: string;
  createdAt: number;
  isPinned: boolean;
}

export type Category = string;
