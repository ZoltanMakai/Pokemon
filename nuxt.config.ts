// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "app/",
  modules: ["@nuxt/ui", "@nuxtjs/sanity"],
  sanity: {
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || "",
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NUXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
    useCdn: true,
  },
  runtimeConfig: {
    /** Server-only; merged over public Sanity config for API routes (private datasets). */
    sanity: {
      token: process.env.NUXT_SANITY_API_READ_TOKEN || "",
    },
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      /**
       * Public site origin for auth emails (password reset, signup confirmation).
       * If unset, the app uses `window.location.origin` when sending links (fine when the tab matches the deploy).
       * On Netlify/Vercel, set `NUXT_PUBLIC_SITE_URL` to your live origin so SSR/build match production.
       * In Supabase Dashboard → Authentication → URL configuration, add redirect URLs:
       * `{siteUrl}/`, `{siteUrl}/reset-password`, and localhost equivalents for dev.
       */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "",
    },
  },
  css: ["~~/assets/css/main.css"],
  ui: {
    theme: {
      defaultVariants: {
        color: "primary",
        size: "md",
      },
    },
  },
});
