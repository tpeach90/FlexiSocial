import { Pool, Client, PoolClient } from 'pg'

// pools will use environment variables
// for connection information
export const pool = new Pool()

// wrapper to connect/release client 
export async function withClient(callback: (client: PoolClient) => any) {
    const client = await pool.connect();
    try {
        await callback(client);
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}