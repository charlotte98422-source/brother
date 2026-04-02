import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcrypt";

dotenv.config();

const { Pool } = pkg;

const app = express();

// Allow ALL CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// PostgreSQL pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // required for Supabase
  },
});

// POST route
app.post("/users", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // hash password

    const query = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username;
    `;

    const result = await pool.query(query, [username, password]);

    res.status(201).json({
      message: "User stored successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
