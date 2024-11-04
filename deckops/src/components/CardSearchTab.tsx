import React, { useState, useEffect } from 'react';
import { Search, Loader, Filter } from 'lucide-react';
import type { YugiohCard } from '../types/deck';
import CardSearchFilters from './CardSearchFilters';
import CardSearchResults from './CardSearchResults';

interface CardSearchTabProps {
  onAddCard: (card: any) => void;
}

export interface SearchFilters {
  type: string;
  race: string;
  attribute: string;
  minAtk: string;
  maxAtk: string;
  minDef: string;
  maxDef: string;
  description: string;
}

const initialFilters: SearchFilters = {
  type: '',
  race: '',
  attribute: '',
  minAtk: '',
  maxAtk: '',
  minDef: '',
  maxDef: '',
  description: '',
};

export default function CardSearchTab({ onAddCard }: CardSearchTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<YugiohCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchCards = async () => {
      if (!searchTerm && !Object.values(filters).some(value => value !== '')) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        // Add search term if present
        if (searchTerm) {
          params.append('fname', searchTerm);
        }

        // For Effect Monster or Normal Monster searches, we'll fetch all cards and filter later
        // because we need to check the typeline array
        if (filters.type && filters.type !== 'Effect Monster' && filters.type !== 'Normal Monster') {
          params.append('type', filters.type);
        }

        // Add race filter
        if (filters.race) {
          params.append('race', filters.race);
        }

        // Add attribute filter
        if (filters.attribute) {
          params.append('attribute', filters.attribute);
        }

        // Base URL for the API
        let url = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

        // If we have any parameters, add them to the URL
        if (params.toString()) {
          url += '?' + params.toString();
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          setResults([]);
          return;
        }

        let filteredCards = data.data;

        // Filter Effect Monsters and Tuners
        if (filters.type === 'Effect Monster') {
          filteredCards = filteredCards.filter((card: YugiohCard) => {
            // Check if the card is an Effect Monster or has "Effect" in its typeline
            const isEffectMonster = card.type === 'Effect Monster';
            const hasEffectType = card.typeline?.includes('Effect');
            const isTunerEffect = card.type.includes('Tuner') && hasEffectType;
            return isEffectMonster || isTunerEffect;
          });
        }

        // Filter Normal Monsters and Normal Tuners
        if (filters.type === 'Normal Monster') {
          filteredCards = filteredCards.filter((card: YugiohCard) => {
            // Check if the card is a Normal Monster or has "Normal" in its typeline
            const isNormalMonster = card.type === 'Normal Monster';
            const hasNormalType = card.typeline?.includes('Normal');
            const isTunerNormal = card.type.includes('Tuner') && hasNormalType;
            return isNormalMonster || isTunerNormal;
          });
        }

        // Apply description filter if present
        if (filters.description) {
          const searchText = filters.description.toLowerCase();
          filteredCards = filteredCards.filter((card: YugiohCard) => 
            card.desc.toLowerCase().includes(searchText)
          );
        }

        // Apply ATK/DEF filters
        if (filters.minAtk) {
          filteredCards = filteredCards.filter((card: YugiohCard) => 
            card.atk !== undefined && card.atk >= parseInt(filters.minAtk)
          );
        }
        if (filters.maxAtk) {
          filteredCards = filteredCards.filter((card: YugiohCard) => 
            card.atk !== undefined && card.atk <= parseInt(filters.maxAtk)
          );
        }
        if (filters.minDef) {
          filteredCards = filteredCards.filter((card: YugiohCard) => 
            card.def !== undefined && card.def >= parseInt(filters.minDef)
          );
        }
        if (filters.maxDef) {
          filteredCards = filteredCards.filter((card: YugiohCard) => 
            card.def !== undefined && card.def <= parseInt(filters.maxDef)
          );
        }

        setResults(filteredCards.slice(0, 50));
        setError(null);
      } catch (err) {
        setResults([]);
        if (err instanceof Error && err.message.includes('No card matching your query was found')) {
          setError(null);
        } else {
          setError('Failed to fetch cards. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchCards, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  return (
    <div className="card p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Advanced Card Search</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards by name..."
            className="input w-full pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {loading ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
          </div>
        </div>

        {showFilters && (
          <CardSearchFilters
            filters={filters}
            setFilters={setFilters}
          />
        )}

        <CardSearchResults
          results={results}
          loading={loading}
          error={error}
          onAddCard={onAddCard}
        />
      </div>
    </div>
  );
}