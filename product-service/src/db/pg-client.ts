import { Pool, PoolClient, PoolConfig } from "pg";

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const pgOptions: PoolConfig = {
  host: PG_HOST,
  port: +PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(pgOptions);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export async function dbClientQuery<T>(query: string, values?: any[]) {
  let client: PoolClient;

  try {
    client = await pool.connect();

    const res = await client.query<T>(query, values);

    return res;
  } catch (err) {
    console.error(`Postgres Error:`, err.message, err.stack);

    throw new Error(`Postgres failed: ${err.message}`);
  } finally {
    client && client.release();
  }
}

export async function dbClientTransaction<T>(transactionQueriesFn: (client: PoolClient) => Promise<T>) {
  let client: PoolClient;

  try {
    client = await pool.connect();

    await client.query("BEGIN");
    const res = await transactionQueriesFn(client);
    await client.query("COMMIT");

    return res;
  } catch (err) {
    console.error(`Postgres Error:`, err.message, err.stack);

    await client.query("ROLLBACK");

    throw new Error(`Postgres failed: ${err.message}`);
  } finally {
    client && client.release();
  }
}
