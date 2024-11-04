import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Edit2, DollarSign, X, Eraser } from 'lucide-react';
import type { Card, CardRole } from '../types/deck';
import CardModal from './CardModal';

interface DeckListProps {
  deck: Card[];
  onRemoveCard: (id: string) => void;
  onUpdateCard: (id: string, updates: Partial<Card>) => void;
  onClearDeck: () => void;
}

const ROLE_OPTIONS: { value: CardRole; label: string }[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'brick', label: 'Brick' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'handTrap', label: 'Hand Trap' },
];

export default function DeckList({ deck, onRemoveCard, onUpdateCard, onClearDeck }: DeckListProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const totalCards = deck.reduce((sum, card) => sum + card.quantity, 0);
  const totalPrice = deck.reduce((sum, card) => sum + (parseFloat(card.price.cardmarket_price) * card.quantity), 0);

  const handleRoleChange = (cardId: string, newRole: CardRole) => {
    onUpdateCard(cardId, { role: newRole });
    setEditingRole(null);
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
  };

  const handleClearDeck = () => {
    onClearDeck();
    setShowClearConfirm(false);
  };

  const getBanStatusColor = (status?: string) => {
    switch (status) {
      case 'Forbidden': return 'bg-red-100 text-red-700';
      case 'Limited': return 'bg-orange-100 text-orange-700';
      case 'Semi-Limited': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Deck List ({totalCards} cards)</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <DollarSign size={20} />
            <span className="text-lg font-semibold">${totalPrice.toFixed(2)}</span>
          </div>
          {deck.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
              title="Clear deck"
            >
              <Eraser size={18} />
              Clear Deck
            </button>
          )}
        </div>
      </div>

      {showClearConfirm && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 mb-4">Are you sure you want to clear the entire deck?</p>
          <div className="flex gap-2">
            <button
              onClick={handleClearDeck}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Clear Deck
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="btn bg-white hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {deck.map((card) => (
          <div
            key={card.id}
            className="overflow-hidden rounded-lg border border-gray-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-10 h-14 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedCard(card)}
                />
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`badge-${card.category}`}>
                      {card.name}
                      <span className="frequency-badge ml-2">{card.quantity}</span>
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getBanStatusColor(card.banStatus)}`}>
                      {card.banStatus || 'Unlimited'}
                    </span>
                  </div>
                  {editingRole !== card.id ? (
                    <div 
                      className={`text-sm mt-1 flex items-center gap-2 role-${card.role}`}
                    >
                      <span>{ROLE_OPTIONS.find(r => r.value === card.role)?.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRole(card.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                        title="Edit role"
                      >
                        <Edit2 size={14} className="text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
                      <select
                        value={card.role}
                        onChange={(e) => handleRoleChange(card.id, e.target.value as CardRole)}
                        className="text-sm py-1 px-2 rounded border border-gray-200 bg-white"
                      >
                        {ROLE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-gray-200 rounded-full"
                        title="Cancel"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-yellow-600 font-medium">
                  ${(parseFloat(card.price.cardmarket_price) * card.quantity).toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemoveCard(card.id)}
                    className="btn-icon"
                    aria-label="Remove card"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedCard === card.id ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
              </div>
            </div>
            {expandedCard === card.id && (
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{card.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                    <PriceItem label="Cardmarket" price={card.price.cardmarket_price} />
                    <PriceItem label="TCGPlayer" price={card.price.tcgplayer_price} />
                    <PriceItem label="eBay" price={card.price.ebay_price} />
                    <PriceItem label="Amazon" price={card.price.amazon_price} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {deck.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Your deck is empty. Add some cards to get started!
          </div>
        )}
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

interface PriceItemProps {
  label: string;
  price: string;
}

function PriceItem({ label, price }: PriceItemProps) {
  return (
    <div className="text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-yellow-600">${parseFloat(price).toFixed(2)}</p>
    </div>
  );
}