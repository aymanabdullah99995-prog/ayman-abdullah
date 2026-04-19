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
  imageUrl?: string;
  createdAt: number;
  isPinned: boolean;
}

export type Category = string;

export interface Section {
  id: string;
  name: string;
  passwordHash: string;
}

export interface Admin {
  id: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  authorizedSections: string[]; // List of section names
  lastUsedSection?: string;
}
