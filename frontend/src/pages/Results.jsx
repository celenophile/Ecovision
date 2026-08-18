import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import { confettiFinale } from "../components/confettiBurst";

export default function Results() {
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const result = useGameStore((s) => s.lastResult);

  useEffect(() => {
    if (!user || !result) {
      navigate(user ? "/how-to-play" : "/register");
    } else {
      confettiFinale();
    }
  }, [user, result, navigate]);

  if (!user || !result) return null;

  const primary = result.primary || result.players[0];
  const accuracy = primary.answered ? Math.round((primary.correct / primary.answered) * 100) : 0;
  const winner = result.players[0];
  const isWinner = winner && winner.id === user.id;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
      <GlassCard strong glow className="w-full max-w-2xl p-8 sm:p-10 text-center animate-risein">
        <div className="text-6xl mb-2">{isWinner ? "🏆" : accuracy >= 70 ? "🌍" : "🌱"}</div>
        <p className="text-xs font-mono uppercase tracking-widest text-bio mt-3">Match Completed</p>

        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 text-gradient">
          {result.mode === "multiplayer" || result.players.length > 1
            ? `${winner.username} Wins the Match!`
            : accuracy >= 70
            ? "Sustainability Champion!"
            : "Eco Explorer"}
        </h1>

        <p className="text-mist/60 text-sm mt-3">
          {result.questionCount} plastic-free product puzzles completed.
        </p>

        {/* Stats metrics */}
        <div className="grid grid-cols-3 gap-4 my-8">
          <Metric label="Your Score" value={primary.score} />
          <Metric label="Accuracy" value={`${accuracy}%`} />
          <Metric label="Best Streak" value={`${primary.bestCombo || 0}×`} />
        </div>

        {/* Player Ranking Leaderboard */}
        {result.players.length > 1 && (
          <GlassCard className="p-5 text-left mb-7 border border-canopy/30">
            <p className="text-xs font-mono uppercase tracking-widest text-bio mb-4 border-b border-white/10 pb-2">
              🏆 Final Leaderboard Standings
            </p>
            <div className="space-y-3">
              {result.players.map((player, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      i === 0
                        ? "bg-canopy/20 border border-canopy/40 font-bold text-bio"
                        : player.id === user.id
                        ? "bg-white/10 text-mist"
                        : "bg-white/[0.03] text-mist/75"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base">{medal}</span>
                      <span className="text-xl">{player.avatar}</span>
                      <span>{player.username}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-sm">
                      <span className="text-mist/60">{player.correct}/{player.answered || 0} correct</span>
                      <span className="font-bold text-canopy">{player.score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/how-to-play"
            className="eco-btn px-8 py-3.5 rounded-2xl bg-canopy text-void font-display font-bold text-base hover:shadow-glow transition-all"
          >
            Play Again →
          </Link>
          <Link
            to="/leaderboard"
            className="px-8 py-3.5 rounded-2xl glass font-semibold text-mist hover:text-mist hover:shadow-glow transition-all"
          >
            Global Ranks
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <GlassCard className="p-3">
      <p className="font-display text-3xl font-bold text-gradient">{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-mist/50 mt-1">{label}</p>
    </GlassCard>
  );
}
