import React from 'react';
import type { Card } from '../types/deck';

interface CardAppearanceRowProps {
  card: Card;
  percentage: number;
}

export default function CardAppearanceRow({ card, percentage }: CardAppearanceRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-200">
      <img
        src={card.imageUrl}
        alt={card.name}
        className="w-10 h-14 object-contain rounded shadow-sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`badge-${card.category} truncate text-sm`}>
            {card.name}
          </span>
          <span className={`badge role-${card.role} text-xs ml-auto`}>
            {card.role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <span className="text-lg font-bold text-gray-900 w-16 text-right">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}