import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: "🌱" },
    score: { type: Number, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    bestCombo: { type: Number, default: 0 },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);
