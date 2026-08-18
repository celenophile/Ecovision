import { Router } from "express";
import { store } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { userId, username, avatar, score, correct, total, bestCombo } = req.body;
    if (!userId || !username || score == null || correct == null || total == null) {
      return res.status(400).json({ error: "Missing required score fields." });
    }
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const saved = await store.saveScore({
      userId,
      username,
      avatar: avatar || "🌱",
      score,
      correct,
      total,
      accuracy,
      bestCombo: bestCombo || 0,
    });
    res.status(201).json({ result: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save score." });
  }
});

export default router;
