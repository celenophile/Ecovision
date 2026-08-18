import { Router } from "express";
import { store } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const leaderboard = await store.getLeaderboard(limit);
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      avatar: entry.avatar,
      score: entry.score,
      accuracy: entry.accuracy,
    }));
    res.json({ leaderboard: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
});

export default router;
