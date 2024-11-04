import React, { useState, useEffect } from 'react';
import { Loader, Plus, ChevronDown, ChevronUp, Trophy, AlertCircle } from 'lucide-react';
import type { YugiohCard } from '../types/deck';

interface MetaDecksProps {
  onAddCard: (card: any) => void;
}

interface Archetype {
  name: string;
  description: string;
  keyCards: YugiohCard[];
  tier: 1 | 2 | 3;
  expanded?: boolean;
}

export default function MetaDecks({ onAddCard }: MetaDecksProps) {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchetypes = async () => {
      try {
        const response = await fetch('https://db.ygoprodeck.com/api/v7/archetypes.php');
        if (!response.ok) throw new Error('Failed to fetch archetypes');
        
        const data = await response.json();
        const topArchetypes = data
          .filter((archetype: { archetype_name: string }) => [
            'Labrynth', 'Rescue-ACE', 'Kashtira', 'Purrely', 'Runick', 'Tearlaments',
            'Spright', 'Mysterune', 'Vernusylph', 'Dragon Link'
          ].includes(archetype.archetype_name))
          .map((archetype: { archetype_name: string }) => ({
            name: archetype.archetype_name,
            description: getArchetypeDescription(archetype.archetype_name),
            keyCards: [],
            tier: getArchetypeTier(archetype.archetype_name),
          }));

        const archetypesWithCards = await Promise.all(
          topArchetypes.map(async (archetype) => {
            try {
              const cardsResponse = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${encodeURIComponent(archetype.name)}`
              );
              const cardsData = await cardsResponse.json();
              return {
                ...archetype,
                keyCards: cardsData.data
                  .sort((a: YugiohCard, b: YugiohCard) => 
                    parseFloat(b.card_prices[0].cardmarket_price) - parseFloat(a.card_prices[0].cardmarket_price)
                  )
                  .slice(0, 5)
              };
            } catch {
              return archetype;
            }
          })
        );

        setArchetypes(archetypesWithCards);
        setLoading(false);
      } catch (err) {
        setError('Failed to load meta decks');
        setLoading(false);
      }
    };

    fetchArchetypes();
  }, []);

  const toggleArchetype = (index: number) => {
    setArchetypes(archetypes.map((arch, i) => 
      i === index ? { ...arch, expanded: !arch.expanded } : arch
    ));
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader className="animate-spin" size={20} />
          <span>Loading meta decks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={24} className="text-yellow-500" />
        <h2 className="text-2xl font-bold">Top Meta Decks</h2>
      </div>

      <div className="space-y-4">
        {archetypes.map((archetype, index) => (
          <div
            key={archetype.name}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300"
          >
            <div
              className="flex items-center justify-between p-4 bg-white cursor-pointer"
              onClick={() => toggleArchetype(index)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{archetype.name}</h3>
                  <span className={`
                    px-2 py-1 text-sm font-medium rounded border
                    ${archetype.tier === 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                    ${archetype.tier === 2 ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                    ${archetype.tier === 3 ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                  `}>
                    Tier {archetype.tier}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{archetype.description}</p>
              </div>
              {archetype.expanded ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {archetype.expanded && (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <h4 className="font-medium text-gray-700 mb-3">Key Cards:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {archetype.keyCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all duration-200"
                    >
                      <img
                        src={card.card_images[0].image_url}
                        alt={card.name}
                        className="w-full h-40 object-contain rounded mb-2"
                      />
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm line-clamp-1" title={card.name}>
                          {card.name}
                        </h5>
                        <p className="text-yellow-600 text-sm font-medium">
                          ${parseFloat(card.card_prices[0].cardmarket_price).toFixed(2)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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
                          }}
                          className="w-full btn bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                        >
                          <Plus size={16} />
                          Add to Deck
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getArchetypeDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'Labrynth': 'A control deck that focuses on setting traps and using powerful field presence.',
    'Rescue-ACE': 'An aggressive combo deck with strong recovery options and disruption capabilities.',
    'Kashtira': 'A powerful deck that focuses on banishing cards and controlling the game state.',
    'Purrely': 'A combo-oriented deck with strong search capabilities and field presence.',
    'Runick': 'A control deck that focuses on spell cards and resource management.',
    'Tearlaments': 'A powerful mill deck with strong graveyard effects and fusion summoning.',
    'Spright': 'A combo deck focusing on Level/Rank 2 monsters with strong consistency.',
    'Mysterune': 'A control deck that uses powerful spell cards and banishing effects.',
    'Vernusylph': 'A combo deck that focuses on plant-type monsters and field control.',
    'Dragon Link': 'A combo deck that utilizes Dragon-type monsters for powerful board presence.'
  };
  return descriptions[name] || 'A powerful meta deck in the current format.';
}

function getArchetypeTier(name: string): 1 | 2 | 3 {
  const tiers: Record<string, 1 | 2 | 3> = {
    'Labrynth': 1,
    'Rescue-ACE': 1,
    'Kashtira': 1,
    'Purrely': 2,
    'Runick': 2,
    'Tearlaments': 2,
    'Spright': 2,
    'Mysterune': 3,
    'Vernusylph': 3,
    'Dragon Link': 2
  };
  return tiers[name] || 3;
}