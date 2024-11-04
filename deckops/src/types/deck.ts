export type CardCategory = 'monster' | 'spell' | 'trap';
export type CardRole = 'starter' | 'brick' | 'neutral' | 'handTrap';
export type BanStatus = 'Forbidden' | 'Limited' | 'Semi-Limited' | 'Unlimited';

export interface CardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuff_price: string;
}

export interface CardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_price: string;
}

export interface YugiohCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  race: string;
  archetype?: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  frameType: string;
  card_sets?: CardSet[];
  card_images: Array<{
    image_url: string;
    image_url_small: string;
  }>;
  card_prices: [CardPrice];
  banlist_info?: {
    ban_tcg?: BanStatus;
    ban_ocg?: BanStatus;
    ban_goat?: BanStatus;
  };
}

export interface BanListCard {
  id: number;
  name: string;
  type: string;
  race: string;
  imageUrl: string;
  banStatus: BanStatus;
  description: string;
}

export interface Card {
  id: string;
  name: string;
  category: CardCategory;
  role: CardRole;
  quantity: number;
  yugiohId: number;
  description: string;
  imageUrl: string;
  price: CardPrice;
  type: string;
  frameType: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  cardSets?: CardSet[];
  banStatus?: BanStatus;
}

export interface SavedDeck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}