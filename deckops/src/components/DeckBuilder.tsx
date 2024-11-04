import React, { useState } from 'react';
import { PlusCircle, MinusCircle, DollarSign } from 'lucide-react';
import type { Card, CardCategory, CardRole, YugiohCard } from '../types/deck';
import CardSearch from './CardSearch';
import YDKImport from './YDKImport';
import { useCardSearch } from '../hooks/useCardSearch';

interface DeckBuilderProps {
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onImportDeck: (cards: Card[]) => void;
  deck: Card[];
}

export default function DeckBuilder({ onAddCard, onImportDeck, deck }: DeckBuilderProps) {
  const [role, setRole] = useState<CardRole>('starter');
  const [quantity, setQuantity] = useState(1);
  const { determineCategory, processBanStatus } = useCardSearch();

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.min(Math.max(1, prev + delta), 3));
  };

  const handleCardSelect = (yugiohCard: YugiohCard) => {
    onAddCard({
      name: yugiohCard.name,
      category: determineCategory(yugiohCard),
      role,
      quantity,
      yugiohId: yugiohCard.id,
      description: yugiohCard.desc,
      imageUrl: yugiohCard.card_images[0].image_url,
      price: yugiohCard.card_prices[0],
      type: yugiohCard.type,
      frameType: yugiohCard.frameType,
      atk: yugiohCard.atk,
      def: yugiohCard.def,
      level: yugiohCard.level,
      race: yugiohCard.race,
      attribute: yugiohCard.attribute,
      cardSets: yugiohCard.card_sets,
      banStatus: processBanStatus(yugiohCard)
    });
    setQuantity(1);
  };

  // Rest of the component remains the same
  const counts = deck.reduce(
    (acc, card) => {
      acc.byRole[card.role] += card.quantity;
      acc.byCategory[card.category] += card.quantity;
      acc.total += card.quantity;
      acc.totalPrice += parseFloat(card.price.cardmarket_price) * card.quantity;
      return acc;
    },
    {
      byRole: { starter: 0, brick: 0, neutral: 0, handTrap: 0 },
      byCategory: { monster: 0, spell: 0, trap: 0 },
      total: 0,
      totalPrice: 0
    } as {
      byRole: Record<CardRole, number>;
      byCategory: Record<CardCategory, number>;
      total: number;
      totalPrice: number;
    }
  );

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Deck Builder ({counts.total} cards)</h2>
        <div className="flex items-center gap-2 text-yellow-600">
          <DollarSign size={20} />
          <span className="text-lg font-semibold">${counts.totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div className="space-y-6">
        <YDKImport onImport={onImportDeck} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <CardSearch onCardSelect={handleCardSelect} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CardRole)}
              className="input"
            >
              <option value="starter">Starter</option>
              <option value="brick">Brick</option>
              <option value="neutral">Neutral</option>
              <option value="handTrap">Hand Trap</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                className="btn-icon"
                disabled={quantity <= 1}
              >
                <MinusCircle size={20} />
              </button>
              <span className="frequency-badge">{quantity}</span>
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                className="btn-icon"
                disabled={quantity >= 3}
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Card Roles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card stat-starter p-4">
                <p className="text-sm mb-1">Starters</p>
                <p className="text-3xl font-bold">{counts.byRole.starter}</p>
              </div>
              <div className="card stat-brick p-4">
                <p className="text-sm mb-1">Bricks</p>
                <p className="text-3xl font-bold">{counts.byRole.brick}</p>
              </div>
              <div className="card stat-neutral p-4">
                <p className="text-sm mb-1">Neutral</p>
                <p className="text-3xl font-bold">{counts.byRole.neutral}</p>
              </div>
              <div className="card stat-handTrap p-4">
                <p className="text-sm mb-1">Hand Traps</p>
                <p className="text-3xl font-bold">{counts.byRole.handTrap}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Card Types</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="card stat-monster p-4">
                <p className="text-sm mb-1">Monsters</p>
                <p className="text-3xl font-bold">{counts.byCategory.monster}</p>
              </div>
              <div className="card stat-spell p-4">
                <p className="text-sm mb-1">Spells</p>
                <p className="text-3xl font-bold">{counts.byCategory.spell}</p>
              </div>
              <div className="card stat-trap p-4">
                <p className="text-sm mb-1">Traps</p>
                <p className="text-3xl font-bold">{counts.byCategory.trap}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}