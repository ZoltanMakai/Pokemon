export interface PokemonAttack {
  name: string;
  damage: number;
}

export interface PokemonCardInput {
  name: string;
  image: string;
  hp: number;
  types: string[];
  attacks: PokemonAttack[];
  weakness: string;
  resistance: string;
  description: string;
}

export interface PokemonCard extends PokemonCardInput {
  id: string;
  user_id: string;
  creator_nickname: string;
  creator_avatar_url: string;
  created_at: string;
  updated_at: string;
}
