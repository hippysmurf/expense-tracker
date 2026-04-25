'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFormData } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-data';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // storage quota exceeded – silently ignore
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadFromStorage());
    setIsLoaded(true);
  }, []);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const expense: Expense = {
      id: generateId(),
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description.trim(),
      date: data.date,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => {
      const next = [expense, ...prev];
      saveToStorage(next);
      return next;
    });
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, data: ExpenseFormData) => {
    setExpenses((prev) => {
      const next = prev.map((e) =>
        e.id === id
          ? {
              ...e,
              amount: parseFloat(data.amount),
              category: data.category,
              description: data.description.trim(),
              date: data.date,
            }
          : e
      );
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setExpenses([]);
    saveToStorage([]);
  }, []);

  return { expenses, isLoaded, addExpense, updateExpense, deleteExpense, clearAll };
}
