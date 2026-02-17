import { Priority } from './types';

export const PRIORITY_COLORS = {
  [Priority.NORMAL]: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  [Priority.IMPORTANT]: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
  [Priority.URGENT]: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300',
};

export const LOCAL_STORAGE_KEY = 'digital_memory_links_v1';
export const DARK_MODE_KEY = 'digital_memory_dark_mode';