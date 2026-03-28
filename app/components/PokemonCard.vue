<template>
  <UCard
    class="flex min-w-[250px] max-w-[280px] flex-col overflow-hidden transition-shadow hover:shadow-lg"
    :ui="{ body: 'p-0 sm:p-0', footer: 'p-3' }">
    <div class="relative aspect-square w-full bg-elevated">
      <img
        v-if="card.image"
        :src="card.image"
        :alt="card.name"
        class="h-full w-full object-contain" />
      <div
        v-else
        class="flex h-full w-full items-center justify-center text-dimmed text-sm">
        No image
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex items-start justify-between gap-2">
        <h2 class="text-lg font-bold text-highlighted">
          {{ card.name }}
        </h2>
        <UBadge color="error" variant="subtle"> HP {{ card.hp }} </UBadge>
      </div>
      <div v-if="card.types?.length" class="flex flex-wrap gap-1">
        <UBadge
          v-for="t in card.types"
          :key="t"
          color="primary"
          variant="subtle">
          {{ t }}
        </UBadge>
      </div>
      <div v-if="card.attacks?.length" class="mt-1 space-y-1">
        <p class="text-xs font-semibold uppercase text-muted">Attacks</p>
        <ul class="space-y-0.5">
          <li
            v-for="(a, i) in card.attacks"
            :key="i"
            class="text-sm text-default">
            {{ a.name }} — {{ a.damage }} dmg
          </li>
        </ul>
      </div>
      <div v-if="card.weakness" class="text-xs text-muted">
        <span class="font-medium text-default">Weakness:</span>
        {{ card.weakness }}
      </div>
      <div v-if="card.resistance" class="text-xs text-muted">
        <span class="font-medium text-default">Resistance:</span>
        {{ card.resistance }}
      </div>
      <p v-if="card.description" class="mt-1 line-clamp-2 text-xs text-dimmed">
        {{ card.description }}
      </p>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 border-t border-default pt-3">
        <div class="flex min-w-0 items-center gap-2">
          <UAvatar
            v-if="card.creator_avatar_url"
            :src="card.creator_avatar_url"
            :alt="card.creator_nickname"
            size="md"
            class="shrink-0 ring ring-default"
            loading="lazy" />
          <UAvatar
            v-else
            size="md"
            class="shrink-0 ring ring-default"
            :text="(card.creator_nickname || '?').slice(0, 1).toUpperCase()" />
          <div class="min-w-0 flex-1">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-muted">
              Creator
            </p>
            <p class="wrap-break-word text-sm font-medium text-default">
              {{ card.creator_nickname }}
            </p>
          </div>
        </div>

        <div v-if="canManage" class="flex flex-wrap gap-2">
          <UButton
            :to="`/edit/${card.id}`"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-pencil">
            Edit
          </UButton>
          <UButton
            color="error"
            variant="outline"
            size="sm"
            icon="i-lucide-trash-2"
            :disabled="busy"
            @click="$emit('delete')">
            {{ busy ? "Deleting..." : "Delete" }}
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { PokemonCard as PokemonCardType } from "~/types/pokemon";

defineProps<{
  card: PokemonCardType;
  canManage?: boolean;
  busy?: boolean;
}>();

defineEmits<{
  delete: [];
}>();
</script>
