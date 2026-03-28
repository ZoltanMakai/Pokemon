<template>
  <UCard class="mx-auto max-w-2xl shadow-md" :ui="{ body: 'p-6 sm:p-8' }">
    <template #header>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ card ? "Edit Pokémon Card" : "Create Pokémon Card" }}
      </h1>
    </template>

    <form class="space-y-6" @submit.prevent="onSubmit">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        class="w-full"
      />

      <UFormField label="Name" name="name">
        <UInput
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="e.g. Pikachu"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Image URL" name="image">
        <UInput
          id="image"
          v-model="form.image"
          type="url"
          placeholder="https://..."
          class="w-full"
        />
      </UFormField>

      <UFormField label="HP" name="hp">
        <UInputNumber
          id="hp"
          v-model="form.hp"
          :min="0"
          required
          placeholder="60"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Types (comma-separated)"
        name="types"
        hint="e.g. Electric, Normal"
      >
        <UInput
          v-model="typesInput"
          type="text"
          placeholder="Electric, Normal"
          class="w-full"
        />
      </UFormField>

      <div>
        <div class="mb-2 flex items-center justify-between gap-2">
          <span class="text-sm font-medium text-default">Attacks</span>
          <UButton type="button" variant="link" color="primary" size="sm" @click="addAttack">
            + Add attack
          </UButton>
        </div>
        <div class="space-y-3">
          <div
            v-for="(attack, index) in form.attacks"
            :key="index"
            class="flex flex-wrap items-end gap-2"
          >
            <UFormField :name="`attack-name-${index}`" class="min-w-0 flex-1">
              <UInput
                v-model="attack.name"
                type="text"
                placeholder="Attack name"
                class="w-full"
              />
            </UFormField>
            <UFormField :name="`attack-dmg-${index}`" class="w-28 shrink-0">
              <UInputNumber
                v-model="attack.damage"
                :min="0"
                placeholder="Damage"
                class="w-full"
              />
            </UFormField>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              icon="i-lucide-x"
              aria-label="Remove attack"
              @click="removeAttack(index)"
            />
          </div>
        </div>
      </div>

      <UFormField label="Weakness" name="weakness">
        <UInput
          id="weakness"
          v-model="form.weakness"
          type="text"
          placeholder="e.g. Fighting"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Resistance" name="resistance">
        <UInput
          id="resistance"
          v-model="form.resistance"
          type="text"
          placeholder="e.g. Metal"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Description / Ability" name="description">
        <UTextarea
          id="description"
          v-model="form.description"
          :rows="3"
          autoresize
          placeholder="Card ability or description..."
          class="w-full"
        />
      </UFormField>

      <div class="flex flex-wrap gap-3 pt-2">
        <UButton
          type="submit"
          color="primary"
          :loading="submitting"
          :disabled="submitting"
        >
          {{ submitting ? "Saving..." : card ? "Save changes" : "Create card" }}
        </UButton>
        <UButton to="/" color="neutral" variant="outline">
          Cancel
        </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import type { PokemonCard, PokemonCardInput } from "~/types/pokemon";

const props = defineProps<{
  card?: PokemonCard | null;
}>();

const router = useRouter();
const { createCard, updateCard } = useCards();
const submitting = ref(false);
const errorMessage = ref("");

const initialFormState = (): PokemonCardInput => ({
  name: "",
  image: "",
  hp: 0,
  types: [],
  attacks: [{ name: "", damage: 0 }],
  weakness: "",
  resistance: "",
  description: "",
});

const form = reactive<PokemonCardInput>(initialFormState());

const typesInput = computed({
  get: () => form.types.join(", "),
  set: (v: string) => {
    form.types = v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
});

function addAttack() {
  form.attacks.push({ name: "", damage: 0 });
}

function removeAttack(index: number) {
  form.attacks.splice(index, 1);
}

function buildPayload() {
  return {
    name: form.name,
    image: form.image,
    hp: Number(form.hp) || 0,
    types: [...form.types],
    attacks: form.attacks
      .filter((a) => a.name.trim())
      .map((a) => ({ name: a.name.trim(), damage: Number(a.damage) || 0 })),
    weakness: form.weakness,
    resistance: form.resistance,
    description: form.description,
  };
}

function syncForm(card?: PokemonCard | null) {
  Object.assign(form, initialFormState());

  if (card) {
    form.name = card.name;
    form.image = card.image;
    form.hp = card.hp;
    form.types = [...(card.types || [])];
    form.attacks = (card.attacks || []).length
      ? card.attacks.map((attack) => ({ name: attack.name, damage: attack.damage }))
      : [{ name: "", damage: 0 }];
    form.weakness = card.weakness ?? "";
    form.resistance = card.resistance ?? "";
    form.description = card.description ?? "";
  }
}

watch(
  () => props.card,
  (card) => {
    syncForm(card);
  },
  { immediate: true },
);

async function onSubmit() {
  errorMessage.value = "";
  submitting.value = true;

  try {
    const payload = buildPayload();

    if (props.card) {
      await updateCard(props.card.id, payload);
    } else {
      await createCard(payload);
    }

    await router.push("/");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to save the card right now.";
  } finally {
    submitting.value = false;
  }
}
</script>
