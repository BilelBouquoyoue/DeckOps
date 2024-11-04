import { useState, useEffect } from 'react';
import type { YugiohCard } from '../types/deck';

const API_BASE_URL = 'https://db.ygoprodeck.com/api/v7';

export function useCardSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<YugiohCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchCards = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/cardinfo.php?fname=${encodeURIComponent(searchTerm)}`
        );
        const data = await response.json();

        if (data.error) {
          setResults([]);
        } else {
          setResults(data.data.slice(0, 10));
        }
      } catch (err) {
        setError('Failed to fetch cards. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchCards, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const determineCategory = (card: YugiohCard) => {
    const type = card.type.toLowerCase();
    if (type.includes('spell')) return 'spell';
    if (type.includes('trap')) return 'trap';
    return 'monster';
  };

  const processBanStatus = (card: YugiohCard) => {
    let banStatus = card.banlist_info?.ban_tcg;
    if (banStatus === 'Banned') {
      banStatus = 'Forbidden';
    }
    return banStatus || 'Unlimited';
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    determineCategory,
    processBanStatus,
  };
}