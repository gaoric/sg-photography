import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const singletonTypes = ["siteSettings", "homePage", "aboutPage", "contactPage"];

export default defineConfig({
  name: "default",
  title: "Sally Gao Photography CMS",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "cn8hqw1o",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((template) => !singletonTypes.includes(template.schemaType))
  }
});
