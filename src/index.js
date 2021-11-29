require("dotenv").config();

const express = require("express");
const { Client } = require("pg");

const app = express();
const port = 5000;

const connect = async () => {
  const client = new Client({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT),
  });

  await client.connect();

  return client;
};

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/users", async (req, res) => {
  try {
    const client = await connect();
    const result = await client.query(
      "SELECT name, email, created_at FROM users"
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/users", async (req, res) => {
  const { name, email, password, confirm } = req.body;
  if (password !== confirm) {
    return res
      .status(400)
      .json({ error: "The password and confirmation must match." });
  }

  const sql = `
    INSERT INTO users(name, email, password)
    VALUES ($1, $2, $3)`;

  const params = [name, email, password];

  try {
    const client = await connect();
    await client.query(sql, params);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }

  return res.sendStatus(201);
});

app.listen(port, () => {
  console.info(`Running of port ${port}...`);
});
