const express = require('express');
const pg = require('pg');

const client = new pg.Client(
  process.env.DATABASE_URL || 
  'postgres://megan.chiu:password@localhost:5432/acme_hr_directory',
);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 

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
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// GET /departments route
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

// POST /employees route
app.post("/employees", async (req, res) => {
  try {
    console.log("Adding employee...")
    const { name, department_id } = req.body;

    if (!name || !department_id) {
      return res.status(400).json({ error: "Name and Department ID are required." });
    }

    if (isNaN(department_id) || department_id <= 0) {
      return res.status(400).json({ error: "Invalid Department ID." });
    }

    const SQL = `
      INSERT INTO employees (name, department_id, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *;
    `;
    const values = [name, department_id];
    console.log('values ', values);

    const response = await client.query(SQL, values);
    console.log('response ', response);
    const newEmployee = response.rows[0];

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error inserting employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /employees route
app.get("/employees", async (req, res) => {
  try {
    console.log("Fetching employees...");
    const SQL = `
      SELECT employees.id, employees.name, employees.department_id, departments.name AS department_name
      FROM employees
      LEFT JOIN departments ON employees.department_id = departments.id;
    `;
    const response = await client.query(SQL);
    console.log("Database response:", response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /employees/:id route
app.delete("/employees/:id", async (req, res) => {
  try {
    console.log("Received DELETE request for employee:", req.params);

    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid Employee ID." });
    }

    const SQL = "DELETE FROM employees WHERE id = $1 RETURNING *;";
    const response = await client.query(SQL, [Number(id)]);

    if (response.rowCount === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }

    res.json({ message: "Employee deleted successfully", deletedEmployee: response.rows[0] });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /employees/:id route
app.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department_id } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid Employee ID." });
    }

    let updateFields = [];
    let updateValues = [];
    let counter = 1;

    if (name) {
      updateFields.push(`name = $${counter}`);
      updateValues.push(name);
      counter++;
    }

    if (department_id) {
      updateFields.push(`department_id = $${counter}`);
      updateValues.push(department_id);
      counter++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update provided." });
    }

    const SQL = `
      UPDATE employees
      SET ${updateFields.join(", ")}
      WHERE id = $${counter}
      RETURNING *;
    `;
    updateValues.push(id);

    const response = await client.query(SQL, updateValues);

    if (response.rowCount === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }

    const updatedEmployee = response.rows[0];
    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

init();