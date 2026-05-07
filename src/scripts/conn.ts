import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DB_CONN_STRING,
  max: 20,
  idleTimeoutMillis: 30000,
});