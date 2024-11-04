import React from 'react';
import { X } from 'lucide-react';
import type { Card } from '../types/deck';

interface CardModalProps {
  card: Card;
  onClose: () => void;
}

export default function CardModal({ card, onClose }: CardModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div 
        className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[101]" 
        onClick={e => e.stopPropagation()}
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-[102]">
          <h2 className="text-2xl font-bold">{card.name}</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            
            <div className="w-full md:w-1/2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Type" value={card.type} />
                <InfoItem label="Frame Type" value={card.frameType} />
                <InfoItem label="Race" value={card.race} />
                {card.attribute && (
                  <InfoItem label="Attribute" value={card.attribute} />
                )}
                {card.level && (
                  <InfoItem label="Level" value={card.level.toString()} />
                )}
                {card.atk !== undefined && (
                  <InfoItem label="ATK" value={card.atk.toString()} />
                )}
                {card.def !== undefined && (
                  <InfoItem label="DEF" value={card.def.toString()} />
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-2">Card Text</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{card.description}</p>
              </div>
            </div>
          </div>

          {card.cardSets && card.cardSets.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Available Card Sets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {card.cardSets.map((set, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{set.set_name}</h4>
                        <p className="text-sm text-gray-500">{set.set_code}</p>
                        <p className="text-sm text-gray-500">Rarity: {set.set_rarity}</p>
                      </div>
                      <p className="text-yellow-600 font-medium">
                        ${parseFloat(set.set_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}