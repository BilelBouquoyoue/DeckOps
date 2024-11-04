import React, { useState } from 'react';
import { Plus, Loader, AlertCircle } from 'lucide-react';
import type { YugiohCard } from '../types/deck';

interface CardSearchResultsProps {
  results: YugiohCard[];
  loading: boolean;
  error: string | null;
  onAddCard: (card: any) => void;
}

export default function CardSearchResults({
  results,
  loading,
  error,
  onAddCard
}: CardSearchResultsProps) {
  const [addedCards, setAddedCards] = useState<{ [key: number]: boolean }>({});

  const handleAddCard = (card: YugiohCard) => {
    // Set animation state for this card
    setAddedCards(prev => ({ ...prev, [card.id]: true }));

    // Add the card to the deck
    onAddCard({
      name: card.name,
      category: card.type.toLowerCase().includes('monster') ? 'monster' : 
                card.type.toLowerCase().includes('spell') ? 'spell' : 'trap',
      role: 'neutral',
      quantity: 1,
      yugiohId: card.id,
      description: card.desc,
      imageUrl: card.card_images[0].image_url,
      price: card.card_prices[0],
      type: card.type,
      frameType: card.frameType,
      atk: card.atk,
      def: card.def,
      level: card.level,
      race: card.race,
      attribute: card.attribute,
      cardSets: card.card_sets,
      banStatus: card.banlist_info?.ban_tcg === 'Banned' ? 'Forbidden' : 
                card.banlist_info?.ban_tcg || 'Unlimited'
    });

    // Reset animation state after animation completes
    setTimeout(() => {
      setAddedCards(prev => ({ ...prev, [card.id]: false }));
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
        <Loader className="animate-spin" size={20} />
        <span>Searching cards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No cards found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {results.map((card) => (
        <div
          key={card.id}
          className={`bg-white p-4 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all duration-200 ${
            addedCards[card.id] ? 'animate-card-add' : ''
          }`}
          style={{
            animation: addedCards[card.id] ? 'cardAdd 0.5s ease-out' : 'none'
          }}
        >
          <img
            src={card.card_images[0].image_url}
            alt={card.name}
            className="w-full h-48 object-contain rounded mb-3"
          />
          <div className="space-y-2">
            <h3 className="font-medium line-clamp-1" title={card.name}>
              {card.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {card.type}
              </span>
              {card.race && (
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {card.race}
                </span>
              )}
              {card.attribute && (
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {card.attribute}
                </span>
              )}
            </div>
            {(card.atk !== undefined || card.def !== undefined) && (
              <div className="flex gap-3 text-sm">
                {card.atk !== undefined && (
                  <span>ATK: {card.atk}</span>
                )}
                {card.def !== undefined && (
                  <span>DEF: {card.def}</span>
                )}
              </div>
            )}
            <p className="text-sm text-gray-600 line-clamp-2" title={card.desc}>
              {card.desc}
            </p>
            <p className="text-yellow-600 font-medium">
              ${parseFloat(card.card_prices[0].cardmarket_price).toFixed(2)}
            </p>
            <button
              onClick={() => handleAddCard(card)}
              className={`w-full btn bg-yellow-50 hover:bg-yellow-100 text-yellow-700 ${
                addedCards[card.id] ? 'animate-button-success' : ''
              }`}
              disabled={addedCards[card.id]}
            >
              <Plus size={16} />
              {addedCards[card.id] ? 'Added!' : 'Add to Deck'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}