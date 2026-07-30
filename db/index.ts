import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getD1() {
  const binding = globalThis.__HUTCH_SALON_ENV__?.DB;
  if (!binding) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB`."
    );
  }
  return binding;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}
