import React, { useState } from 'react';
import { RefreshCcw, Lightbulb } from 'lucide-react';
import type { Card, DrawResult, SimulationResult } from '../types/deck';
import SimulationSettings from './SimulationSettings';
import StatCard from './StatCard';
import CardAppearanceRow from './CardAppearanceRow';

interface SimulatorProps {
  deck: Card[];
}

export default function Simulator({ deck }: SimulatorProps) {
  const [drawCount, setDrawCount] = useState(5);
  const [simulations, setSimulations] = useState(1);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const expandDeck = (deck: Card[]): Card[] => {
    return deck.flatMap(card => 
      Array(card.quantity).fill(null).map((_, index) => ({
        ...card,
        id: `${card.id}-${index}`
      }))
    );
  };

  const shuffle = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const simulateDraw = (): DrawResult => {
    const expandedDeck = expandDeck(deck);
    const shuffledDeck = shuffle(expandedDeck);
    const drawnCards = shuffledDeck.slice(0, drawCount);
    
    const summary = drawnCards.reduce(
      (acc, card) => {
        acc.byRole[card.role]++;
        acc.byCategory[card.category]++;
        return acc;
      },
      {
        byRole: { starter: 0, brick: 0, neutral: 0, handTrap: 0 },
        byCategory: { monster: 0, spell: 0, trap: 0 }
      }
    );

    return { cards: drawnCards, summary };
  };

  const runSimulation = () => {
    const draws: DrawResult[] = [];
    const totalSummary = {
      byRole: { starter: 0, brick: 0, neutral: 0, handTrap: 0 },
      byCategory: { monster: 0, spell: 0, trap: 0 }
    };

    for (let i = 0; i < simulations; i++) {
      const draw = simulateDraw();
      draws.push(draw);
      
      Object.entries(draw.summary.byRole).forEach(([role, count]) => {
        totalSummary.byRole[role as keyof typeof totalSummary.byRole] += count;
      });
      
      Object.entries(draw.summary.byCategory).forEach(([category, count]) => {
        totalSummary.byCategory[category as keyof typeof totalSummary.byCategory] += count;
      });
    }

    const averages = {
      byRole: {
        starter: totalSummary.byRole.starter / simulations,
        brick: totalSummary.byRole.brick / simulations,
        neutral: totalSummary.byRole.neutral / simulations,
        handTrap: totalSummary.byRole.handTrap / simulations,
      },
      byCategory: {
        monster: totalSummary.byCategory.monster / simulations,
        spell: totalSummary.byCategory.spell / simulations,
        trap: totalSummary.byCategory.trap / simulations,
      }
    };

    setResult({ draws, averages });
  };

  const calculateCardStats = () => {
    if (!result) return [];

    const cardStats = new Map<string, { 
      appearances: number, 
      card: Card 
    }>();

    deck.forEach(card => {
      cardStats.set(card.name, { appearances: 0, card });
    });

    result.draws.forEach(draw => {
      draw.cards.forEach(card => {
        const stats = cardStats.get(card.name);
        if (stats) {
          stats.appearances++;
        }
      });
    });

    return Array.from(cardStats.entries())
      .map(([_, stats]) => ({
        ...stats,
        percentage: (stats.appearances / result.draws.length) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const getDeckTips = () => {
    if (!result) return [];
    const tips: string[] = [];
    const { averages } = result;

    // Starters tips
    if (averages.byRole.starter < 1.8) {
      tips.push("Your deck lacks combo initiators. Consider adding more Starter cards to improve consistency and combo potential.");
    } else if (averages.byRole.starter > 2.5) {
      tips.push("Strong combo potential with many Starters! Ensure you maintain enough defensive options with Handtraps.");
    }

    // Bricks tips
    if (averages.byRole.brick > 1) {
      tips.push("High number of Bricks detected. Consider reducing situational cards to improve opening hand consistency.");
    } else if (averages.byRole.brick < 0.5) {
      tips.push("Excellent brick ratio! Your deck should consistently produce playable hands.");
    }

    // Handtraps tips
    if (averages.byRole.handTrap < 0.8) {
      tips.push("Low Handtrap count may leave you vulnerable. Consider adding more defensive options.");
    } else if (averages.byRole.handTrap > 1.5) {
      tips.push("Strong defensive capabilities with high Handtrap count. Ensure this doesn't compromise your combo potential.");
    }

    // Balance tips
    const starterToBrickRatio = averages.byRole.starter / (averages.byRole.brick || 1);
    if (starterToBrickRatio < 3) {
      tips.push("The ratio between Starters and Bricks could be improved. Aim for at least 3 Starters for every Brick.");
    }

    return tips;
  };

  const totalCards = deck.reduce((sum, card) => sum + card.quantity, 0);

  if (totalCards < drawCount) {
    return (
      <div className="card !bg-yellow-50 border-yellow-200 p-6 text-yellow-800">
        Add at least {drawCount} cards to your deck to start simulating draws.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SimulationSettings
        drawCount={drawCount}
        setDrawCount={setDrawCount}
        simulations={simulations}
        setSimulations={setSimulations}
        onRunSimulation={runSimulation}
        maxCards={totalCards}
      />

      {result && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Simulation Results</h2>
            <button onClick={() => setResult(null)} className="btn-icon">
              <RefreshCcw size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Average Cards by Role</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Starters per Hand"
                  value={result.averages.byRole.starter}
                  className="stat-starter"
                />
                <StatCard
                  label="Bricks per Hand"
                  value={result.averages.byRole.brick}
                  className="stat-brick"
                />
                <StatCard
                  label="Neutral per Hand"
                  value={result.averages.byRole.neutral}
                  className="stat-neutral"
                />
                <StatCard
                  label="Hand Traps per Hand"
                  value={result.averages.byRole.handTrap}
                  className="stat-handTrap"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Average Cards by Type</h3>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Monsters per Hand"
                  value={result.averages.byCategory.monster}
                  className="stat-monster"
                />
                <StatCard
                  label="Spells per Hand"
                  value={result.averages.byCategory.spell}
                  className="stat-spell"
                />
                <StatCard
                  label="Traps per Hand"
                  value={result.averages.byCategory.trap}
                  className="stat-trap"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-blue-900">Deck Building Tips</h3>
              </div>
              <ul className="space-y-2">
                {getDeckTips().map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-700">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Card Appearance Rates</h3>
              <div className="space-y-2">
                {calculateCardStats().map(({ card, percentage }) => (
                  <CardAppearanceRow
                    key={card.id}
                    card={card}
                    percentage={percentage}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}