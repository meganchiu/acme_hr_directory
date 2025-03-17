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
    DROP TABLE IF EXISTS departments;

    -- Create departments table
    CREATE TABLE departments(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    -- Insert seed data into departments
    INSERT INTO departments (name) VALUES 
      ('Engineering'),
      ('HR'),
      ('Sales'),
      ('Finance'),
      ('Customer Service'),
      ('Marketing');

    -- Create employees table with a foreign key to departments
    CREATE TABLE employees(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL
    );
  `;

  await client.query(SQL);
  console.log('Tables created & data seeded...');

  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:5173',  // Replace with the URL of your frontend if needed
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get("/departments", async (req, res) => {
  try {
    console.log("Fetching departments...");
    const SQL = "SELECT * FROM departments;";
    console.log("Executing query:", SQL);
    const response = await client.query(SQL);
    console.log("Database response:", response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
  }
});

init();