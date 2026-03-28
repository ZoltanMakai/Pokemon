// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "app/",
  modules: ["@nuxt/ui"],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      /**
       * Public site origin for password-reset emails (e.g. https://yourdomain.com).
       * If unset, the app uses `window.location.origin` when sending reset links (fine for local dev).
       * In Supabase Dashboard → Authentication → URL configuration, add redirect URLs:
       * `{siteUrl}/reset-password` (and `http://localhost:3000/reset-password` for local).
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
