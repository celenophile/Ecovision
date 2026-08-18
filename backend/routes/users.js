import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";

const router = Router();

const AVATARS = ["🌱", "🌿", "🍃", "🌳", "🌍", "♻️", "🐝", "🦋", "🌻", "🐢"];

router.post("/register", async (req, res) => {
  try {
    const { name, username, email, ageGroup } = req.body;
    if (!name || !username || !email || !ageGroup) {
      return res.status(400).json({ error: "name, username, email and ageGroup are required." });
    }

    const existing = await store.getUserByUsername(username.toLowerCase());
    if (existing) {
      return res.json({ user: existing, isNew: false });
    }

    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const user = await store.createUser({
      id: nanoid(10),
      name,
      username: username.toLowerCase(),
      email,
      ageGroup,
      avatar,
    });

    res.status(201).json({ user, isNew: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register user." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await store.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

export default router;
