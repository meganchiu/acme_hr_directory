const express = require('express');

const pg = require('pg');

const client = new pg.Client(
  process.env.DATABASE_URL || 
  'postgres://megan.chiu:password@localhost:5432/acme_hr_directory',
);

const app = express();
const PORT = process.env.PORT || 3000;

const init = async() => {
  await client.connect();
  console.log('DB connected...')
  const SQL = /*sql*/ `
    DROP TABLE IF EXISTS employees;
    CREATE TABLE employees(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `
  await client.query(SQL);
  console.log('Table created...');

  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

init();