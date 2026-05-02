import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem, FileType } from '../types';
import { getHistory, addToHistory, removeFromHistory, clearHistory as clearStorageHistory } from '../lib/storage';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const addItem = useCallback((fileName: string, fileType: FileType, content: string) => {
    const newItem = addToHistory({ fileName, fileType, content });
    setHistory(prev => [newItem, ...prev].slice(0, 20));
    return newItem;
  }, []);

  const removeItem = useCallback((id: string) => {
    removeFromHistory(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    clearStorageHistory();
    setHistory([]);
  }, []);

  return { history, addItem, removeItem, clearHistory };
}