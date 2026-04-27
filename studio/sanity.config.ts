import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./schemaTypes";

/** Set in studio/.env — same project/dataset as Pokemon: NUXT_PUBLIC_SANITY_* */
const projectId = import.meta.env.SANITY_STUDIO_PROJECT_ID as string;
const dataset = (import.meta.env.SANITY_STUDIO_DATASET as string) || "production";

export default defineConfig({
  name: "pokemon-studio",
  title: "Pokemon CMS",
  projectId: projectId || "",
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
