import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

// La connexion est créée à la demande (pas au chargement du module) pour éviter
// que Next.js échoue au build : l'étape "Collect page data" importe les routes
// API sans que les variables d'environnement d'exécution soient garanties.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (_db) return _db;

  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error(
      'TURSO_CONNECTION_URL et TURSO_AUTH_TOKEN doivent être définies (Storage → connecter Turso sur le projet Vercel).'
    );
  }

  const client = createClient({ url, authToken });
  _db = drizzle(client, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export type Database = ReturnType<typeof getDb>;