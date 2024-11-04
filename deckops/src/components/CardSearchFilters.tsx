import React from 'react';
import type { SearchFilters } from './CardSearchTab';

interface CardSearchFiltersProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

const CARD_TYPES = {
  monster: [
    'Effect Monster',
    'Normal Monster',
    'Fusion Monster',
    'Synchro Monster',
    'XYZ Monster',
    'Link Monster',
    'Ritual Monster',
    'Pendulum Effect Monster',
    'Pendulum Normal Monster'
  ],
  spell: ['Spell Card'],
  trap: ['Trap Card']
};

const RACES = {
  monster: [
    'Aqua', 'Beast', 'Beast-Warrior', 'Cyberse', 'Dinosaur', 'Divine-Beast',
    'Dragon', 'Fairy', 'Fiend', 'Fish', 'Insect', 'Machine', 'Plant',
    'Psychic', 'Pyro', 'Reptile', 'Rock', 'Sea Serpent', 'Spellcaster',
    'Thunder', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie'
  ],
  spell: [
    'Normal', 'Field', 'Equip', 'Continuous', 'Quick-Play', 'Ritual'
  ],
  trap: [
    'Normal', 'Continuous', 'Counter'
  ]
};

const ATTRIBUTES = [
  'DARK', 'LIGHT', 'WATER', 'FIRE', 'EARTH', 'WIND', 'DIVINE'
];

export default function CardSearchFilters({ filters, setFilters }: CardSearchFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      setFilters(prev => ({
        ...prev,
        [name]: value,
        race: '',
        attribute: value.includes('Monster') ? prev.attribute : '',
        minAtk: value.includes('Monster') ? prev.minAtk : '',
        maxAtk: value.includes('Monster') ? prev.maxAtk : '',
        minDef: value.includes('Monster') ? prev.minDef : '',
        maxDef: value.includes('Monster') ? prev.maxDef : ''
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const getAvailableRaces = () => {
    if (filters.type.includes('Monster')) {
      return RACES.monster;
    } else if (filters.type === 'Spell Card') {
      return RACES.spell;
    } else if (filters.type === 'Trap Card') {
      return RACES.trap;
    }
    return [];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Card Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="input w-full"
        >
          <option value="">Any Type</option>
          <optgroup label="Monsters">
            {CARD_TYPES.monster.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </optgroup>
          <optgroup label="Spells">
            {CARD_TYPES.spell.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </optgroup>
          <optgroup label="Traps">
            {CARD_TYPES.trap.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {filters.type && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {filters.type === 'Spell Card' ? 'Spell Type' : 
             filters.type === 'Trap Card' ? 'Trap Type' : 
             'Race/Type'}
          </label>
          <select
            name="race"
            value={filters.race}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="">Any {filters.type === 'Spell Card' ? 'Spell Type' : 
                               filters.type === 'Trap Card' ? 'Trap Type' : 
                               'Race'}</option>
            {getAvailableRaces().map(race => (
              <option key={race} value={race}>{race}</option>
            ))}
          </select>
        </div>
      )}

      {filters.type.includes('Monster') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Attribute</label>
          <select
            name="attribute"
            value={filters.attribute}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="">Any Attribute</option>
            {ATTRIBUTES.map(attr => (
              <option key={attr} value={attr}>{attr}</option>
            ))}
          </select>
        </div>
      )}

      {filters.type.includes('Monster') && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ATK Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="minAtk"
                value={filters.minAtk}
                onChange={handleChange}
                placeholder="Min"
                className="input w-full"
              />
              <input
                type="number"
                name="maxAtk"
                value={filters.maxAtk}
                onChange={handleChange}
                placeholder="Max"
                className="input w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">DEF Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="minDef"
                value={filters.minDef}
                onChange={handleChange}
                placeholder="Min"
                className="input w-full"
              />
              <input
                type="number"
                name="maxDef"
                value={filters.maxDef}
                onChange={handleChange}
                placeholder="Max"
                className="input w-full"
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Card Text</label>
        <input
          type="text"
          name="description"
          value={filters.description}
          onChange={handleChange}
          placeholder="Search card text..."
          className="input w-full"
        />
      </div>
    </div>
  );
}