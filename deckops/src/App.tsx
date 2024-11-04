import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Swords, Scroll, ListFilter, Search, Shield } from 'lucide-react';
import DeckBuilder from './components/DeckBuilder';
import DeckList from './components/DeckList';
import Simulator from './components/Simulator';
import DeckManager from './components/DeckManager';
import BanList from './components/BanList';
import CardSearchTab from './components/CardSearchTab';
import AdminPanel from './components/AdminPanel';
import SwordSoulEasterEgg from './components/SwordSoulEasterEgg';
import { useDeckStorage } from './hooks/useDeckStorage';
import type { Card } from './types/deck';

type Tab = 'deck' | 'banlist' | 'search' | 'admin';

export default function App() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('deck');
  const [easterEggVisible, setEasterEggVisible] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const { savedDecks, saveDeck, updateDeck, deleteDeck } = useDeckStorage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key) {  // Check if key exists
        setKeySequence(prev => {
          const newSequence = prev + e.key.toUpperCase();
          if (newSequence.includes('BEHDNONE')) {
            setEasterEggVisible(true);
            setTimeout(() => setEasterEggVisible(false), 10000); // Hide after 10 seconds
            return '';
          }
          return newSequence.slice(-8); // Keep only last 8 characters
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddCard = (card: Omit<Card, 'id'>) => {
    const existingCard = deck.find(c => c.yugiohId === card.yugiohId);
    if (existingCard) {
      const newQuantity = Math.min(existingCard.quantity + card.quantity, 3);
      setDeck(deck.map(c => 
        c.yugiohId === card.yugiohId 
          ? { ...c, quantity: newQuantity }
          : c
      ));
    } else {
      setDeck([...deck, { ...card, id: nanoid() }]);
    }
  };

  const handleRemoveCard = (id: string) => {
    setDeck(deck.filter(card => card.id !== id));
  };

  const handleUpdateCard = (id: string, updates: Partial<Card>) => {
    setDeck(deck.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
  };

  const handleLoadDeck = (cards: Card[]) => {
    setDeck(cards);
  };

  const handleImportDeck = (cards: Card[]) => {
    setDeck(cards);
  };

  const handleClearDeck = () => {
    setDeck([]);
  };

  // Hidden admin tab activation
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.altKey && e.key === 'a') {
      setActiveTab('admin');
    }
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <SwordSoulEasterEgg isVisible={easterEggVisible} />
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <Swords size={40} className="text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
              Yu-Gi-Oh! DeckOps
            </h1>
            <Scroll size={40} className="text-yellow-400" />
          </div>
          <p className="text-blue-200 text-lg">
            It's time to d-d-d-d-duel! Build and optimize your deck with advanced statistics.
          </p>
        </header>

        <div className="flex justify-center gap-4 mb-8">
          <TabButton 
            active={activeTab === 'deck'} 
            onClick={() => setActiveTab('deck')}
            icon={<Scroll size={18} />}
          >
            Deck Builder
          </TabButton>
          <TabButton 
            active={activeTab === 'banlist'} 
            onClick={() => setActiveTab('banlist')}
            icon={<ListFilter size={18} />}
          >
            Ban List
          </TabButton>
          <TabButton 
            active={activeTab === 'search'} 
            onClick={() => setActiveTab('search')}
            icon={<Search size={18} />}
          >
            Card Search
          </TabButton>
          {activeTab === 'admin' && (
            <TabButton 
              active={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')}
              icon={<Shield size={18} />}
            >
              Admin
            </TabButton>
          )}
        </div>

        {activeTab === 'deck' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DeckBuilder 
                onAddCard={handleAddCard} 
                onImportDeck={handleImportDeck}
                deck={deck} 
              />
              <DeckList 
                deck={deck} 
                onRemoveCard={handleRemoveCard} 
                onUpdateCard={handleUpdateCard}
                onClearDeck={handleClearDeck}
              />
            </div>
            <div className="space-y-8">
              <DeckManager
                deck={deck}
                onLoadDeck={handleLoadDeck}
                savedDecks={savedDecks}
                onSaveDeck={saveDeck}
                onUpdateDeck={updateDeck}
                onDeleteDeck={deleteDeck}
              />
              <Simulator deck={deck} />
            </div>
          </div>
        ) : activeTab === 'banlist' ? (
          <BanList />
        ) : activeTab === 'search' ? (
          <CardSearchTab onAddCard={handleAddCard} />
        ) : activeTab === 'admin' ? (
          <AdminPanel />
        ) : null}

        <footer className="text-center pt-8 border-t border-blue-800">
          <p className="text-blue-300 text-sm">
            © 2024 Bouquoyoue Bilel Dynamics. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function TabButton({ active, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
        ${active 
          ? 'bg-white text-gray-900 shadow-lg' 
          : 'bg-white/10 text-white hover:bg-white/20'
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}