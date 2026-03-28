<template>
  <div>
    <UCard v-if="!authResolved" :ui="{ body: 'p-12 text-center' }">
      <USkeleton class="mx-auto h-4 w-48" />
      <p class="mt-4 text-sm text-muted">Checking your session...</p>
    </UCard>

    <PokemonCardForm v-else-if="card && isOwner" :card="card" />

    <UAlert
      v-else-if="!card"
      color="neutral"
      variant="soft"
      title="Card not found."
      class="w-full"
    >
      <template #actions>
        <UButton to="/" color="primary" variant="link" class="mt-2 p-0">
          Back to cards
        </UButton>
      </template>
    </UAlert>

    <UAlert
      v-else-if="!user"
      color="warning"
      variant="soft"
      title="You need to log in before editing cards."
      class="w-full"
    >
      <template #actions>
        <UButton to="/login" color="primary" variant="link" class="mt-2 p-0">
          Go to log in
        </UButton>
      </template>
    </UAlert>

    <UAlert
      v-else
      color="warning"
      variant="soft"
      title="You can only edit cards that you created."
      class="w-full"
    >
      <template #actions>
        <UButton to="/" color="primary" variant="link" class="mt-2 p-0">
          Back to cards
        </UButton>
      </template>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
import type { PokemonCard } from "~/types/pokemon";

const route = useRoute();
const { authResolved, user } = useResolvedAuthUser();
const { getCardById } = useCards();

const id = computed(() => String(route.params.id || ""));
const card = ref<PokemonCard | null>(null);

if (id.value) {
  card.value = await getCardById(id.value);
}

const isOwner = computed(() => {
  if (!card.value || !user.value) {
    return false;
  }

  return card.value.user_id === user.value.id;
});
</script>
