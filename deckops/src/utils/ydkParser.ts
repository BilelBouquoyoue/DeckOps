import type { Card, CardCategory, CardRole } from '../types/deck';

interface CardData {
  id: number;
  name: string;
  type: string;
  desc: string;
  race: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  frameType: string;
  card_sets?: Array<{
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_price: string;
  }>;
  card_images: Array<{ image_url: string }>;
  card_prices: [{
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuff_price: string;
  }];
  banlist_info?: {
    ban_tcg?: string;
    ban_ocg?: string;
    ban_goat?: string;
  };
}

interface APIResponse {
  data: CardData[];
}

export class YDKParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YDKParseError';
  }
}

export async function parseYDKFile(file: File): Promise<Card[]> {
  try {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim());
    
    const mainStart = lines.findIndex(line => line === '#main');
    if (mainStart === -1) {
      throw new YDKParseError('Invalid YDK file format: Missing #main section');
    }

    const extraStart = lines.findIndex((line, index) => 
      index > mainStart && (line === '#extra' || line === '!side')
    );
    
    const mainDeckLines = extraStart !== -1
      ? lines.slice(mainStart + 1, extraStart)
      : lines.slice(mainStart + 1);

    const cardIds = mainDeckLines
      .filter(line => /^\d+$/.test(line))
      .map(line => parseInt(line, 10));

    if (cardIds.length === 0) {
      throw new YDKParseError('No valid cards found in the main deck section');
    }

    if (cardIds.length < 40) {
      throw new YDKParseError('Main deck must contain at least 40 cards');
    }

    if (cardIds.length > 60) {
      throw new YDKParseError('Main deck cannot contain more than 60 cards');
    }

    const cardCounts = new Map<number, number>();
    cardIds.forEach(id => {
      cardCounts.set(id, (cardCounts.get(id) || 0) + 1);
    });

    for (const [id, count] of cardCounts) {
      if (count > 3) {
        throw new YDKParseError(`Card ID ${id} appears more than 3 times (${count} copies found)`);
      }
    }

    const uniqueIds = Array.from(cardCounts.keys());
    const cards = await fetchCardData(uniqueIds, cardCounts);
    
    if (cards.length === 0) {
      throw new YDKParseError('Failed to import any valid cards');
    }

    return cards;
  } catch (error) {
    if (error instanceof YDKParseError) {
      throw error;
    }
    throw new YDKParseError('Failed to parse YDK file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function fetchCardData(uniqueIds: number[], cardCounts: Map<number, number>): Promise<Card[]> {
  const results = await Promise.allSettled(
    uniqueIds.map(async (id) => {
      const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch card data (HTTP ${response.status})`);
      }
      const data: APIResponse = await response.json();
      return { id, data: data.data[0] };
    })
  );

  const successfulResults = results
    .filter((result): result is PromiseFulfilledResult<{ id: number; data: CardData }> => 
      result.status === 'fulfilled'
    )
    .map(result => {
      const { id, data } = result.value;
      const quantity = cardCounts.get(id) || 0;
      
      // Process ban status
      let banStatus = data.banlist_info?.ban_tcg;
      if (banStatus === 'Banned') {
        banStatus = 'Forbidden';
      }
      
      return {
        id: String(id),
        name: data.name,
        category: determineCategory(data.type),
        role: determineRole(data),
        quantity,
        yugiohId: id,
        description: data.desc,
        imageUrl: data.card_images[0].image_url,
        price: data.card_prices[0],
        type: data.type,
        frameType: data.frameType,
        atk: data.atk,
        def: data.def,
        level: data.level,
        race: data.race,
        attribute: data.attribute,
        cardSets: data.card_sets,
        banStatus: banStatus || 'Unlimited'
      };
    });

  if (successfulResults.length === 0) {
    throw new YDKParseError('Failed to fetch any valid card data from the API');
  }

  return successfulResults;
}

function determineCategory(type: string): CardCategory {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('spell')) return 'spell';
  if (lowerType.includes('trap')) return 'trap';
  return 'monster';
}

function determineRole(card: CardData): CardRole {
  const lowerDesc = card.desc.toLowerCase();
  const lowerName = card.name.toLowerCase();
  
  if (lowerDesc.includes('hand') && (lowerDesc.includes('negate') || lowerDesc.includes('discard'))) {
    return 'handTrap';
  }
  
  if (lowerDesc.includes('search') || lowerDesc.includes('draw') || lowerName.includes('starter')) {
    return 'starter';
  }
  
  if (lowerDesc.includes('cannot be normal summoned') || lowerDesc.includes('cannot be special summoned')) {
    return 'brick';
  }
  
  return 'neutral';
}