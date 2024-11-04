import React from 'react';
import { PlayCircle } from 'lucide-react';

interface SimulationSettingsProps {
  drawCount: number;
  setDrawCount: (count: number) => void;
  simulations: number;
  setSimulations: (count: number) => void;
  onRunSimulation: () => void;
  maxCards: number;
}

export default function SimulationSettings({
  drawCount,
  setDrawCount,
  simulations,
  setSimulations,
  onRunSimulation,
  maxCards,
}: SimulationSettingsProps) {
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-4">Simulation Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cards to Draw
            </label>
            <input
              type="number"
              min="1"
              max={maxCards}
              value={drawCount}
              onChange={(e) => setDrawCount(Number(e.target.value))}
              className="input w-full bg-white/90"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Number of Simulations
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={simulations}
              onChange={(e) => setSimulations(Number(e.target.value))}
              className="input w-full bg-white/90"
            />
          </div>
        </div>
      </div>
      <button onClick={onRunSimulation} className="btn-primary w-full mt-4">
        <PlayCircle size={20} />
        Run Simulation
      </button>
    </div>
  );
}