import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";

export default function HowToPlay() {
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const setSession = useGameStore((s) => s.setSession);
  const [mode, setMode] = useState("single"); // "single" | "host" | "join"

  if (!user) {
    navigate("/register");
    return null;
  }

  const handleStart = () => {
    if (mode === "host") {
      navigate("/host");
      return;
    }

    if (mode === "join") {
      navigate("/join");
      return;
    }

    // Single player mode
    setSession({
      mode: "single",
      questionCount: 5,
      participants: [{ id: user.id, username: user.username, avatar: user.avatar || "🌱" }],
    });
    navigate("/game");
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 animate-risein">
          <p className="text-xs font-mono uppercase tracking-widest text-bio mb-3">Set your mission</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Choose a game mode</h1>
          <p className="text-mist/60 mt-4">
            Every round starts blurred. Guess from clues, earn points, avoid plastic, and climb the live leaderboards!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <ModeCard
            active={mode === "single"}
            onClick={() => setMode("single")}
            icon="🎯"
            title="Single Player"
            subtitle="30s timer per question"
            text="A fast-paced solo sprint. 30 seconds to answer each product puzzle before auto-timeout."
          />

          <ModeCard
            active={mode === "host"}
            onClick={() => setMode("host")}
            icon="👑"
            title="Host Multiplayer"
            subtitle="6-char Code & QR Code"
            text="Create a live Kahoot-style room with a 1-minute match limit. Generate QR code for players to scan & join!"
          />

          <ModeCard
            active={mode === "join"}
            onClick={() => setMode("join")}
            icon="📱"
            title="Join Multiplayer"
            subtitle="Scan QR or Enter Code"
            text="Join an existing room using a 6-character room code or scanned QR link to compete in real-time."
          />
        </div>

        <GlassCard strong glow className="mt-8 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-display text-xl font-bold">Ready to see beyond plastic?</p>
            <p className="text-sm text-mist/55">
              {mode === "single"
                ? "5 plastic-free product puzzles · 30s countdown each"
                : mode === "host"
                ? "Host real-time game · 1-minute total match timer"
                : "Enter room code or scan QR code to join"}
            </p>
          </div>
          <button
            onClick={handleStart}
            className="eco-btn px-8 py-4 rounded-2xl bg-canopy text-void font-display font-bold text-lg hover:shadow-glow transition-all"
          >
            {mode === "single" ? "Start Solo Game →" : mode === "host" ? "Create Room →" : "Join Room →"}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function ModeCard({ active, onClick, icon, title, subtitle, text }) {
  return (
    <button
      onClick={onClick}
      className={`glass text-left p-6 rounded-3xl border transition-all flex flex-col justify-between ${
        active ? "border-canopy bg-canopy/15 shadow-glow scale-[1.02]" : "border-white/10 hover:border-canopy/40"
      }`}
    >
      <div>
        <span className="text-4xl">{icon}</span>
        <p className="font-display text-2xl font-bold mt-4">{title}</p>
        <p className="text-bio text-xs font-mono mt-1">{subtitle}</p>
        <p className="text-sm text-mist/60 mt-3 leading-relaxed">{text}</p>
      </div>
      <div className={`mt-6 text-xs font-mono font-bold flex items-center gap-1 ${active ? "text-canopy" : "text-mist/40"}`}>
        {active ? "✓ Selected" : "Click to select"}
      </div>
    </button>
  );
}
