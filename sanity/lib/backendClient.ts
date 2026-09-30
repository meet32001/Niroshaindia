import 'server-only';
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./client";

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN;

if (!token) {
  console.error("❌ CRITICAL: SANITY_API_TOKEN is missing from environment variables!");
}

export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});
