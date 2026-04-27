<template>
  <div class="space-y-10">
    <UCard
      v-if="homeBanner?.text"
      class="border-default text-white shadow-sm"
      :style="{ backgroundColor: safeBannerColor }"
      :ui="{ body: 'p-5 lg:p-6' }">
      <p class="text-sm font-semibold uppercase tracking-widest text-white/80">
        CMS banner
      </p>
      <p class="mt-2 text-xl font-semibold tracking-tight">
        {{ homeBanner.text }}
      </p>
    </UCard>

    <UCard
      class="overflow-hidden border-default bg-linear-to-br from-default via-elevated to-primary/5 shadow-lg"
      :ui="{ body: 'p-6 lg:p-8' }">
      <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <UBadge
            color="primary"
            variant="subtle"
            class="uppercase tracking-widest">
            Pokemon collection
          </UBadge>
          <h1
            class="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl">
            Organize your cards in a cleaner, more modern workspace.
          </h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-muted">
            Browse every Pokemon card in the collection. Sign in to create and
            manage the cards that belong to you.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="user ? '/create' : '/login'"
              color="primary"
              size="lg">
              {{ user ? "Create card" : "Log in to create" }}
            </UButton>
            <UButton
              v-if="authResolved && !user"
              to="/register"
              color="neutral"
              variant="outline"
              size="lg">
              Create account
            </UButton>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <UCard :ui="{ body: 'p-5' }">
            <p class="text-sm font-medium text-muted">Total cards</p>
            <p
              class="mt-3 text-3xl font-semibold tracking-tight text-highlighted">
              {{ cards.length }}
            </p>
            <p class="mt-2 text-sm text-muted">
              Public collection count updates instantly.
            </p>
          </UCard>
          <UCard :ui="{ body: 'p-5' }">
            <p class="text-sm font-medium text-muted">Signed-in trainer</p>
            <p class="mt-3 text-lg font-semibold text-highlighted">
              {{
                authResolved
                  ? user
                    ? nickname
                    : "Guest browsing mode"
                  : "Checking session..."
              }}
            </p>
            <p class="mt-2 text-sm text-muted">
              {{
                !authResolved
                  ? "Your session is being restored before account actions are shown."
                  : user
                    ? "You can create, edit, and delete only your own cards."
                    : "Guests can view every card, but cannot create, edit, or delete them."
              }}
            </p>
          </UCard>
        </div>
      </div>
    </UCard>

    <UAlert
      v-if="cardsError"
      color="error"
      variant="soft"
      :title="cardsError"
      class="w-full" />

    <UCard v-if="loading && !loaded" :ui="{ body: 'p-12' }">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        <div v-for="i in 6" :key="i" class="space-y-3">
          <USkeleton class="aspect-square w-full rounded-lg" />
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </div>
      <p class="mt-8 text-center text-sm text-muted">Loading cards...</p>
    </UCard>

    <div v-else-if="cards.length > 0" class="space-y-5">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-widest text-primary">
            Public collection
          </p>
          <h2
            class="mt-2 text-2xl font-semibold tracking-tight text-highlighted">
            Pokemon Cards
          </h2>
        </div>
        <p class="text-sm text-muted">
          Browse every card. Edit and delete controls appear only on cards you
          own.
        </p>
      </div>

      <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        <PokemonCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
          :can-manage="card.user_id === user?.id"
          :busy="deletingId === card.id"
          @delete="handleDelete(card.id)" />
      </div>
    </div>

    <UCard v-else class="border-dashed" :ui="{ body: 'p-12 text-center' }">
      <UBadge color="info" variant="subtle" class="uppercase tracking-widest">
        Start here
      </UBadge>
      <h2 class="mt-5 text-3xl font-semibold tracking-tight text-highlighted">
        No Pokemon cards yet.
      </h2>
      <p class="mx-auto mt-3 max-w-lg text-base leading-7 text-muted">
        No cards have been published yet. Create an account to become the first
        trainer to add one.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UButton :to="user ? '/create' : '/login'" color="primary" size="lg">
          {{ user ? "Create your first card" : "Log in to create cards" }}
        </UButton>
        <UButton
          v-if="authResolved && !user"
          to="/register"
          color="neutral"
          variant="outline"
          size="lg">
          Create account
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const toast = useToast();
const { cards, error, loading, loaded, refreshCards, deleteCard } = useCards();
const { authResolved, user } = useResolvedAuthUser();
const nickname = useUserNickname();
const deletingId = ref<string | null>(null);
const { data: homeBanner } = await useAsyncData(
  "home-banner",
  async () => {
    const response = await $fetch<{
      text: string;
      backgroundColor: string;
    } | null>("/api/cms/banner");

    return response ?? null;
  },
  {
    default: () => null,
  },
);

await refreshCards();

const cardsError = computed(() => error.value);
const safeBannerColor = computed(() => {
  const color = homeBanner.value?.backgroundColor?.trim() || "";
  const isHexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);

  return isHexColor ? color : "#1D4ED8";
});

async function handleDelete(id: string) {
  deletingId.value = id;

  try {
    await deleteCard(id);
  } catch (deleteError) {
    const message =
      deleteError instanceof Error
        ? deleteError.message
        : "Unable to delete this card right now.";

    toast.add({
      title: message,
      color: "error",
    });
  } finally {
    deletingId.value = null;
  }
}
</script>
