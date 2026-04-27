<template>
  <div class="space-y-6" v-if="cmsPage">
    <template v-for="block in cmsPage.content" :key="block._key">
      <UCard
        v-if="block._type === 'homeBannerRef' && block.text"
        class="border-default text-white shadow-sm"
        :style="{
          backgroundColor: safeColor(block.backgroundColor, '#1D4ED8'),
        }"
        :ui="{ body: 'p-5 lg:p-6' }">
        <p class="text-xl font-semibold tracking-tight">{{ block.text }}</p>
      </UCard>

      <UCard
        v-else-if="block._type === 'bigDog'"
        class="border-default text-white shadow-sm"
        :style="{
          backgroundColor: safeColor(block.backgroundColor, '#0F172A'),
        }"
        :ui="{ body: 'p-5 lg:p-6' }">
        <div class="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <p class="text-lg leading-7">{{ block.text }}</p>
          </div>
          <img
            v-if="block.imageUrl"
            :src="block.imageUrl"
            :alt="block.imageAlt || ''"
            class="h-48 w-full rounded-lg object-cover" />
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
type CmsPageBlock =
  | {
      _type: "bigDog";
      _key: string;
      text: string;
      backgroundColor: string;
      imageUrl: string | null;
      imageAlt: string;
    }
  | {
      _type: "homeBannerRef";
      _key: string;
      text: string | null;
      backgroundColor: string | null;
    };

type CmsPageResponse = {
  title: string;
  slug: string;
  content: CmsPageBlock[];
} | null;

const route = useRoute();
const pageSlug = computed(() => String(route.params.slug || ""));

const { data: cmsPage } = await useAsyncData(
  () => `cms-page-${pageSlug.value}`,
  async () => {
    if (!pageSlug.value) {
      return null;
    }

    const response = await $fetch<CmsPageResponse>(
      `/api/cms/page/${pageSlug.value}`,
    );
    return response ?? null;
  },
  {
    default: () => null,
    watch: [pageSlug],
  },
);

if (!cmsPage.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
  });
}

function safeColor(color: string | null, fallback: string) {
  const value = color?.trim() || "";
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value) ? value : fallback;
}
</script>
