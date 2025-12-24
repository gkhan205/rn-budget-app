import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema/*',
  out: './drizzle',
  dbCredentials: {
    url: 'file:./budgetflow.db'
  },
  verbose: true,
  strict: true,
});
