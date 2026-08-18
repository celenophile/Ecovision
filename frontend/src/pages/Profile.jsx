import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import { fetchLeaderboard } from "../api";

export default function Profile() {
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const logout = useGameStore((s) => s.logout);
  const profileStats = useGameStore((s) => s.profileStats);

  const [rank, setRank] = useState(null);
  const [globalTotal, setGlobalTotal] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/register");
      return;
    }
    fetchLeaderboard(200)
      .then((entries) => {
        setGlobalTotal(entries.length);
        const mine = entries.find((e) => e.userId === user.id);
        setRank(mine ? mine.rank : null);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;

  const accuracy = profileStats.answered ? Math.round((profileStats.correct / profileStats.answered) * 100) : 0;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard strong glow className="p-8 sm:p-10 mb-8 animate-risein">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-3xl bg-canopy/20 border border-canopy/30 flex items-center justify-center text-5xl shrink-0">
              {user.avatar}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-display text-3xl font-bold text-mist">{user.name}</h1>
              <p className="text-bio font-mono text-sm mt-1">@{user.username}</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <Tag>{user.ageGroup}</Tag>
                <Tag>{user.email}</Tag>
                {rank && <Tag accent>🏆 Global Rank #{rank}{globalTotal ? ` of ${globalTotal}` : ""}</Tag>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-white/10 text-mist/50 hover:text-mist hover:border-white/20 text-sm transition-all shrink-0"
            >
              Log out
            </button>
          </div>
        </GlassCard>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Best Score" value={profileStats.bestScore} accent="text-gradient" />
          <StatCard label="Accuracy" value={`${accuracy}%`} accent="text-bio" />
          <StatCard label="Games Played" value={profileStats.gamesPlayed} accent="text-spore" />
          <StatCard label="Best Combo" value={`${profileStats.bestCombo}x`} accent="text-mist" />
        </div>

        <GlassCard className="p-8 text-center">
          <p className="text-mist/60 mb-5">Ready for another round of eco identification?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/how-to-play"
              className="eco-btn px-6 py-3.5 rounded-2xl bg-canopy text-void font-display font-bold hover:shadow-glowLg transition-all"
            >
              Play EcoVision →
            </Link>
            <Link
              to="/leaderboard"
              className="px-6 py-3.5 rounded-2xl glass font-semibold text-mist/90 hover:shadow-glow transition-all"
            >
              View Leaderboard
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Tag({ children, accent }) {
  return (
    <span
      className={`text-xs px-3 py-1.5 rounded-full border ${
        accent ? "border-canopy/40 bg-canopy/15 text-bio" : "border-white/10 bg-white/[0.03] text-mist/60"
      }`}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <GlassCard className="p-5 text-center">
      <p className={`font-display text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-mist/50 mt-1.5">{label}</p>
    </GlassCard>
  );
}
