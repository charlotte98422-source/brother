import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

// Default JSON parser
app.use(express.json());

// Additional parser for text/plain (for sendBeacon)
app.use(express.text({ type: "text/plain" }));

// Allow all CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Handle /users POST
app.post("/users", async (req, res) => {
  let { username, password } = req.body;

  // If the body is a string (from sendBeacon), parse it as JSON
  if (typeof req.body === "string") {
    try {
      ({ username, password } = JSON.parse(req.body));
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, password }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: "User stored successfully", user: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
