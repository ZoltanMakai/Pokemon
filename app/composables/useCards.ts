import type {
  PokemonAttack,
  PokemonCard,
  PokemonCardInput,
} from "~/types/pokemon";

interface CardRow {
  id: string;
  user_id: string;
  creator_nickname: string | null;
  creator_avatar_url: string | null;
  name: string;
  image: string | null;
  hp: number | null;
  types: unknown;
  attacks: unknown;
  weakness: string | null;
  resistance: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  profiles_public?:
    | {
        nickname?: string | null;
        avatar_url?: string | null;
      }
    | {
        nickname?: string | null;
        avatar_url?: string | null;
      }[]
    | null;
}

const cardSelect = `
  id,
  user_id,
  creator_nickname,
  creator_avatar_url,
  name,
  image,
  hp,
  types,
  attacks,
  weakness,
  resistance,
  description,
  created_at,
  updated_at,
  profiles_public!pokemon_cards_user_id_fkey (
    nickname,
    avatar_url
  )
`;

function normalizeAttacks(attacks: unknown): PokemonAttack[] {
  if (!Array.isArray(attacks)) {
    return [];
  }

  return attacks
    .filter(
      (attack): attack is { name?: unknown; damage?: unknown } =>
        typeof attack === "object" && attack !== null,
    )
    .map((attack) => ({
      name: typeof attack.name === "string" ? attack.name.trim() : "",
      damage:
        typeof attack.damage === "number"
          ? attack.damage
          : Number(attack.damage) || 0,
    }))
    .filter((attack) => attack.name);
}

function normalizeTypes(types: unknown) {
  if (!Array.isArray(types)) {
    return [];
  }

  return types.filter((type): type is string => typeof type === "string");
}

const CREATOR_PLACEHOLDER = "Unknown trainer";

function pickPublicProfile(row: CardRow) {
  const raw = row.profiles_public;
  if (!raw) {
    return null;
  }
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function isPlaceholderCreatorNickname(value: string | null | undefined) {
  const t = value?.trim() ?? "";
  return !t || t === CREATOR_PLACEHOLDER;
}

function mapCard(row: CardRow): PokemonCard {
  const pub = pickPublicProfile(row);
  const nickFromRowRaw = row.creator_nickname?.trim() ?? "";
  const nickFromRow = isPlaceholderCreatorNickname(nickFromRowRaw)
    ? ""
    : nickFromRowRaw;
  const nickFromProfile = pub?.nickname?.trim() ?? "";
  const avatarFromRow = row.creator_avatar_url?.trim() ?? "";
  const avatarFromProfile = pub?.avatar_url?.trim() ?? "";

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    image: row.image ?? "",
    hp: Number(row.hp) || 0,
    types: normalizeTypes(row.types),
    attacks: normalizeAttacks(row.attacks),
    weakness: row.weakness ?? "",
    resistance: row.resistance ?? "",
    description: row.description ?? "",
    creator_nickname: nickFromProfile || nickFromRow || CREATOR_PLACEHOLDER,
    creator_avatar_url: avatarFromProfile || avatarFromRow,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildCardPayload(payload: PokemonCardInput) {
  return {
    name: payload.name.trim(),
    image: payload.image.trim(),
    hp: Math.max(0, Number(payload.hp) || 0),
    types: payload.types.map((type) => type.trim()).filter(Boolean),
    attacks: payload.attacks
      .filter((attack) => attack.name.trim())
      .map((attack) => ({
        name: attack.name.trim(),
        damage: Math.max(0, Number(attack.damage) || 0),
      })),
    weakness: payload.weakness.trim(),
    resistance: payload.resistance.trim(),
    description: payload.description.trim(),
  };
}

export function useCards() {
  const supabase = useSupabaseClient();
  const user = useAuthUser();
  const cards = useState<PokemonCard[]>("pokemon-cards", () => []);
  const loading = useState<boolean>("pokemon-cards-loading", () => false);
  const loaded = useState<boolean>("pokemon-cards-loaded", () => false);
  const error = useState<string | null>("pokemon-cards-error", () => null);

  async function refreshCards() {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase
      .from("pokemon_cards")
      .select(cardSelect)
      .order("created_at", { ascending: false });

    if (fetchError) {
      error.value = fetchError.message;
      cards.value = [];
      loading.value = false;
      loaded.value = true;
      return [];
    }

    cards.value = (data ?? []).map((row) => mapCard(row as CardRow));
    loading.value = false;
    loaded.value = true;
    return cards.value;
  }

  async function getCardById(id: string) {
    const existing = cards.value.find((card) => card.id === id);

    if (existing) {
      return existing;
    }

    const { data, error: fetchError } = await supabase
      .from("pokemon_cards")
      .select(cardSelect)
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !data) {
      return null;
    }

    const card = mapCard(data as CardRow);
    const nextCards = cards.value.filter((item) => item.id !== card.id);
    nextCards.unshift(card);
    cards.value = nextCards;

    return card;
  }

  async function createCard(payload: PokemonCardInput) {
    if (!user.value) {
      throw new Error("You must be signed in to create a card.");
    }

    const { data, error: insertError } = await supabase
      .from("pokemon_cards")
      .insert({
        user_id: user.value.id,
        ...buildCardPayload(payload),
      })
      .select(cardSelect)
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const card = mapCard(data as CardRow);
    cards.value = [card, ...cards.value];

    return card;
  }

  async function updateCard(id: string, payload: PokemonCardInput) {
    if (!user.value) {
      throw new Error("You must be signed in to edit a card.");
    }

    const { data, error: updateError } = await supabase
      .from("pokemon_cards")
      .update(buildCardPayload(payload))
      .eq("id", id)
      .eq("user_id", user.value.id)
      .select(cardSelect)
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!data) {
      throw new Error(
        "Card not found or you do not have permission to edit it.",
      );
    }

    const card = mapCard(data as CardRow);
    cards.value = cards.value.map((existing) =>
      existing.id === card.id ? card : existing,
    );

    return card;
  }

  async function deleteCard(id: string) {
    if (!user.value) {
      throw new Error("You must be signed in to delete a card.");
    }

    const { error: deleteError } = await supabase
      .from("pokemon_cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.value.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    cards.value = cards.value.filter((card) => card.id !== id);
  }

  return {
    cards,
    loading,
    loaded,
    error,
    refreshCards,
    getCardById,
    createCard,
    updateCard,
    deleteCard,
  };
}
