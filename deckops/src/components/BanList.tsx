import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, Loader } from 'lucide-react';
import type { BanListCard } from '../types/deck';

export default function BanList() {
  const [banList, setBanList] = useState<BanListCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'forbidden' | 'limited' | 'semi-limited'>('forbidden');

  useEffect(() => {
    const fetchBanList = async () => {
      try {
        const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=tcg');
        if (!response.ok) throw new Error('Failed to fetch banlist');
        
        const data = await response.json();
        setBanList(data.data.map((card: any) => ({
          id: card.id,
          name: card.name,
          type: card.type,
          race: card.race,
          imageUrl: card.card_images[0].image_url,
          banStatus: card.banlist_info?.ban_tcg === 'Banned' ? 'Forbidden' : card.banlist_info?.ban_tcg || 'Unlimited',
          description: card.desc,
        })));
        setLoading(false);
      } catch (err) {
        setError('Failed to load banlist data');
        setLoading(false);
      }
    };

    fetchBanList();
  }, []);

  const filteredCards = banList.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(filter.toLowerCase());
    const matchesTab = 
      (activeTab === 'forbidden' && card.banStatus === 'Forbidden') ||
      (activeTab === 'limited' && card.banStatus === 'Limited') ||
      (activeTab === 'semi-limited' && card.banStatus === 'Semi-Limited');
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader className="animate-spin" size={20} />
          <span>Loading banlist...</span>
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
      <h2 className="text-2xl font-bold mb-6">TCG Banlist</h2>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search cards..."
              className="input w-full pl-10"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <TabButton 
              active={activeTab === 'forbidden'} 
              onClick={() => setActiveTab('forbidden')}
              className="bg-red-50 text-red-700 border-red-200"
            >
              Forbidden
            </TabButton>
            <TabButton 
              active={activeTab === 'limited'} 
              onClick={() => setActiveTab('limited')}
              className="bg-orange-50 text-orange-700 border-orange-200"
            >
              Limited
            </TabButton>
            <TabButton 
              active={activeTab === 'semi-limited'} 
              onClick={() => setActiveTab('semi-limited')}
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              Semi-Limited
            </TabButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => (
            <div 
              key={card.id}
              className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200"
            >
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-20 h-28 object-contain rounded shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">{card.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{card.type} / {card.race}</p>
                <div className={`
                  inline-flex items-center px-2 py-1 rounded text-sm font-medium
                  ${card.banStatus === 'Forbidden' ? 'bg-red-100 text-red-700' : ''}
                  ${card.banStatus === 'Limited' ? 'bg-orange-100 text-orange-700' : ''}
                  ${card.banStatus === 'Semi-Limited' ? 'bg-yellow-100 text-yellow-700' : ''}
                `}>
                  {card.banStatus}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cards found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function TabButton({ active, onClick, children, className = '' }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 font-medium text-sm
        ${active ? className : 'bg-white hover:bg-gray-50'}
        border-x first:border-l-0 last:border-r-0 border-gray-200
        transition-colors duration-200
      `}
    >
      {children}
    </button>
  );
}