<template>
  <UApp>
    <div
      class="min-h-dvh bg-default text-default transition-colors"
    >
      <div
        class="pointer-events-none fixed inset-x-0 top-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          class="mx-auto h-80 max-w-6xl opacity-60 blur-3xl dark:opacity-40"
          style="
            background: radial-gradient(
                circle at top,
                color-mix(in oklch, var(--ui-color-primary-500) 35%, transparent),
                transparent 58%
              ),
              radial-gradient(
                circle at 20% 20%,
                color-mix(in oklch, var(--ui-color-info-400) 25%, transparent),
                transparent 30%
              ),
              radial-gradient(
                circle at 80% 0%,
                color-mix(in oklch, var(--ui-color-primary-400) 20%, transparent),
                transparent 34%
              );
          "
        />
      </div>
      <AppHeader />
      <UMain>
        <UContainer class="py-8 pb-16 sm:py-10 sm:pb-20">
          <UCard
            class="border-default shadow-xl dark:shadow-2xl"
            :ui="{ body: 'p-5 sm:p-6 lg:p-8' }"
          >
            <NuxtPage />
          </UCard>
        </UContainer>
      </UMain>
    </div>
  </UApp>
</template>
