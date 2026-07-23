import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let database: D1Database | null = null;

export function setDatabaseBinding(binding: D1Database) {
  database = binding;
}

export function getDb() {
  if (!database) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable."
    );
  }

  return drizzle(database, { schema });
}

export function getD1() {
  if (!database) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }

  return database;
}
