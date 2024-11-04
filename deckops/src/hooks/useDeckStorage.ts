import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { Card, SavedDeck } from '../types/deck';

const STORAGE_KEY = 'yugioh-decks';

export function useDeckStorage() {
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedDecks(JSON.parse(stored));
    }
  }, []);

  const saveDeck = (name: string, cards: Card[]) => {
    const newDeck: SavedDeck = {
      id: nanoid(),
      name,
      cards,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedDecks = [...savedDecks, newDeck];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));
    setSavedDecks(updatedDecks);
    return newDeck;
  };

  const updateDeck = (id: string, name: string, cards: Card[]) => {
    const updatedDecks = savedDecks.map(deck => 
      deck.id === id 
        ? { ...deck, name, cards, updatedAt: new Date().toISOString() }
        : deck
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));
    setSavedDecks(updatedDecks);
  };

  const deleteDeck = (id: string) => {
    const updatedDecks = savedDecks.filter(deck => deck.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));
    setSavedDecks(updatedDecks);
  };

  return {
    savedDecks,
    saveDeck,
    updateDeck,
    deleteDeck,
  };
}