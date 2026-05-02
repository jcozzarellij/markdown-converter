import type { HistoryItem } from '../types';

const CURRENT_KEY = 'mdconvert_current';
const HISTORY_KEY = 'mdconvert_history';
const MAX_HISTORY = 20;

export function getCurrentContent(): string {
  return localStorage.getItem(CURRENT_KEY) || '';
}

export function setCurrentContent(content: string): void {
  localStorage.setItem(CURRENT_KEY, content);
}

export function getHistory(): HistoryItem[] {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function addToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  const updated = [newItem, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return newItem;
}

export function removeFromHistory(id: string): void {
  const history = getHistory().filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.setItem(HISTORY_KEY, '[]');
}

export function clearCurrent(): void {
  localStorage.setItem(CURRENT_KEY, '');
}