<template>
  <UHeader
    as="header"
    class="border-default bg-elevated/80 supports-backdrop-filter:backdrop-blur-xl"
  >
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-3 shrink-0">
        <UAvatar
          alt="Pokemon Cards"
          size="md"
          class="rounded-xl bg-primary text-inverted font-black"
          text="P"
        />
        <div class="min-w-0 text-left">
          <p class="text-lg font-semibold tracking-tight text-highlighted truncate">
            Pokemon Cards
          </p>
          <p class="text-sm text-muted truncate max-sm:hidden">
            Build, browse, and securely manage your collection.
          </p>
        </div>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="navMenuItems"
      variant="pill"
      color="neutral"
      class="justify-center w-full min-w-0"
    />

    <template #right>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <UColorModeButton />

        <template v-if="user">
          <UDropdownMenu :items="accountMenuItems">
            <UButton
              color="neutral"
              variant="ghost"
              class="max-w-[min(100%,280px)]"
            >
              <UAvatar
                v-if="publicProfile?.avatar_url?.trim()"
                :src="publicProfile.avatar_url.trim()"
                size="sm"
                class="shrink-0"
              />
              <UAvatar
                v-else
                size="sm"
                class="shrink-0"
                :text="nickname ? nickname.slice(0, 1).toUpperCase() : '?'"
              />
              <span class="min-w-0 text-left">
                <span class="block truncate font-medium text-highlighted">{{ nickname }}</span>
                <span class="block truncate text-xs text-muted">{{ user.email }}</span>
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-dimmed" />
            </UButton>
          </UDropdownMenu>
        </template>

        <template v-else-if="authResolved">
          <UButton to="/login" color="neutral" variant="outline">
            Log in
          </UButton>
          <UButton to="/register" color="primary">
            Create account
          </UButton>
        </template>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const route = useRoute();
const { authResolved, user } = useResolvedAuthUser();
const nickname = useUserNickname();
const { publicProfile } = useTrainerProfile();
const supabase = useSupabaseClient();

const navLinks = computed(() => {
  const links = [{ label: "Cards", to: "/" }];

  if (user.value) {
    links.push({ label: "Create Card", to: "/create" });
  }

  return links;
});

const navMenuItems = computed(() => [
  navLinks.value.map((link) => ({
    label: link.label,
    to: link.to,
    active: route.path === link.to,
  })),
]);

const accountMenuItems = computed(() => [
  [
    {
      label: "Edit profile",
      icon: "i-lucide-user-round-pen",
      to: "/profile",
    },
  ],
  [
    {
      label: "Log out",
      icon: "i-lucide-log-out",
      onSelect: () => {
        void logout();
      },
    },
  ],
]);

async function logout() {
  await supabase.auth.signOut();
  await navigateTo("/");
}
</script>
