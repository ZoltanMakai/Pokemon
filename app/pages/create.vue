<template>
  <div class="space-y-6">
    <UCard v-if="!authResolved" :ui="{ body: 'p-10 text-center' }">
      <USkeleton class="mx-auto h-4 w-56" />
      <p class="mt-4 text-sm text-muted">Checking your session...</p>
    </UCard>

    <UAlert
      v-else-if="!user"
      color="neutral"
      variant="outline"
      title="Sign in required"
      description="You can browse every card without logging in, but creating a card requires your own account."
      class="w-full"
    >
      <template #actions>
        <div class="mt-4 flex flex-wrap justify-center gap-3">
          <UButton to="/login" color="primary">
            Log in
          </UButton>
          <UButton to="/register" color="neutral" variant="outline">
            Create account
          </UButton>
        </div>
      </template>
    </UAlert>

    <PokemonCardForm v-else />
  </div>
</template>

<script setup lang="ts">
const { authResolved, user } = useResolvedAuthUser();
</script>
