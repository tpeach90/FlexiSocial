import { Connection } from 'postgresql-client';

// specify the database using environment variaibles.

// PGHOST = localhost
// PGPORT = 5432
// PGDATABASE = flexisocial
// PGUSER = flexisocial-user
// PGPASSWORD = <password> # enter the password here
// PGSCHEMA = public


console.log(process.env.DATABASE_URL)

// export const connection = new Connection(process.env.DATABASE_URL);

export const connection = new Connection();