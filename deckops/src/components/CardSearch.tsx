import React from 'react';
import { Search, Loader } from 'lucide-react';
import { useCardSearch } from '../hooks/useCardSearch';
import type { YugiohCard } from '../types/deck';

interface CardSearchProps {
  onCardSelect: (card: YugiohCard) => void;
}

export default function CardSearch({ onCardSelect }: CardSearchProps) {
  const { searchTerm, setSearchTerm, results, isLoading, error } = useCardSearch();

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Yu-Gi-Oh! cards..."
          className="input w-full pl-10"
          autoComplete="off"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}

      {results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {results.map((card) => (
            <button
              key={card.id}
              onClick={() => {
                onCardSelect(card);
                setSearchTerm('');
              }}
              className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors duration-200"
            >
              <img
                src={card.card_images[0].image_url_small}
                alt={card.name}
                className="w-10 h-14 object-contain rounded"
              />
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900">{card.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{card.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}