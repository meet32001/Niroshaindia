import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./client";

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN;

if (!token) {
  console.warn("⚠️ SANITY_API_TOKEN is missing. Order creation in Sanity will fail without write permissions.");
}

export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});
