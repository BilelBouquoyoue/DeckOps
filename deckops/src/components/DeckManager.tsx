import React, { useState } from 'react';
import { Save, Trash2, Download, Plus, FileDown } from 'lucide-react';
import type { Card, SavedDeck } from '../types/deck';
import { generateYDKContent, downloadYDKFile } from '../utils/ydkExporter';

interface DeckManagerProps {
  deck: Card[];
  onLoadDeck: (cards: Card[]) => void;
  savedDecks: SavedDeck[];
  onSaveDeck: (name: string, cards: Card[]) => void;
  onUpdateDeck: (id: string, name: string, cards: Card[]) => void;
  onDeleteDeck: (id: string) => void;
}

export default function DeckManager({
  deck,
  onLoadDeck,
  savedDecks,
  onSaveDeck,
  onUpdateDeck,
  onDeleteDeck,
}: DeckManagerProps) {
  const [newDeckName, setNewDeckName] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (!newDeckName.trim()) return;

    if (selectedDeckId) {
      onUpdateDeck(selectedDeckId, newDeckName, deck);
    } else {
      onSaveDeck(newDeckName, deck);
    }

    setNewDeckName('');
    setSelectedDeckId(null);
    setIsEditing(false);
  };

  const handleLoad = (savedDeck: SavedDeck) => {
    onLoadDeck(savedDeck.cards);
    setSelectedDeckId(savedDeck.id);
  };

  const handleExportYDK = (deckToExport: Card[], name: string) => {
    const content = generateYDKContent(deckToExport);
    downloadYDKFile(content, name || 'deck');
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col space-y-6">
        {/* Current Deck Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Current Deck</h2>
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => handleExportYDK(deck, 'current-deck')}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
              disabled={deck.length === 0}
              title="Export as YDK"
            >
              <FileDown size={18} />
              Export YDK
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
              disabled={deck.length === 0}
            >
              <Save size={18} />
              Save Deck
            </button>
          </div>
        </div>

        {/* Save Deck Form */}
        {isEditing && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Enter deck name..."
                className="input flex-1"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!newDeckName.trim()}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  <Plus size={18} />
                  {selectedDeckId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewDeckName('');
                  }}
                  className="btn bg-white hover:bg-gray-50 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Decks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">Saved Decks</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <Plus size={18} />
                New Deck
              </button>
            )}
          </div>

          <div className="space-y-3">
            {savedDecks.map((savedDeck) => (
              <div
                key={savedDeck.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                  selectedDeckId === savedDeck.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{savedDeck.name}</h3>
                  <p className="text-sm text-gray-500">
                    {savedDeck.cards.length} cards • Last updated{' '}
                    {new Date(savedDeck.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <button
                    onClick={() => handleExportYDK(savedDeck.cards, savedDeck.name)}
                    className="btn-icon"
                    title="Export as YDK"
                  >
                    <FileDown size={18} />
                  </button>
                  <button
                    onClick={() => handleLoad(savedDeck)}
                    className="btn-icon"
                    title="Load deck"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteDeck(savedDeck.id)}
                    className="btn-icon text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete deck"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {savedDecks.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                No saved decks yet. Create your first deck and save it!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}