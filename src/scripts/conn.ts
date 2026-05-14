import { Pool } from "pg";
import {neon} from "@neondatabase/serverless";

export const pool = new Pool({
  connectionString: process.env.DB_CONN_STRING,
  max: 20,
  idleTimeoutMillis: 30000,
});

export const psql = neon(process.env.DB_CONN_STRING!)