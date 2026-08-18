import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import { fetchLeaderboard } from "../api";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const user = useGameStore((s) => s.user);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchLeaderboard(100);
      setEntries(data);
    } catch (err) {
      setError("Couldn't load the leaderboard. Is the backend running on http://localhost:5000?");
    } finally {
      setLoading(false);
    }
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12 animate-risein">
          <p className="text-xs font-mono uppercase tracking-widest text-bio mb-3">Global rankings</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Leaderboard</h1>
          <p className="text-mist/60 mt-4">See who's leading the fight against plastic — ranked by score and accuracy.</p>
        </div>

        {loading && <p className="text-center text-mist/50 text-sm">Loading rankings…</p>}
        {error && (
          <GlassCard className="p-6 text-center text-sm text-red-300">
            {error}
            <button onClick={load} className="block mx-auto mt-3 underline text-mist/70">
              Try again
            </button>
          </GlassCard>
        )}

        {!loading && !error && entries.length === 0 && (
          <GlassCard className="p-10 text-center">
            <p className="text-mist/60">No scores yet — be the first to play!</p>
            <Link to="/game" className="inline-block mt-4 eco-btn px-6 py-3 rounded-xl bg-canopy text-void font-semibold">
              Play Now
            </Link>
          </GlassCard>
        )}

        {!loading && top3.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-5 mb-8 items-end">
            {[top3[1], top3[0], top3[2]].map((entry, idx) =>
              entry ? (
                <PodiumCard
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={user && entry.userId === user.id}
                  raised={idx === 1}
                />
              ) : (
                <div key={idx} />
              )
            )}
          </div>
        )}

        {rest.length > 0 && (
          <GlassCard className="p-3 sm:p-4">
            {rest.map((entry) => (
              <RankRow key={entry.userId} entry={entry} isCurrentUser={user && entry.userId === user.id} />
            ))}
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ entry, isCurrentUser, raised }) {
  return (
    <GlassCard
      strong
      glow={raised}
      className={`p-6 text-center animate-risein ${raised ? "sm:-translate-y-4" : ""} ${
        isCurrentUser ? "ring-2 ring-canopy" : ""
      }`}
    >
      <p className="text-4xl mb-2">{MEDALS[entry.rank - 1] || "🎖️"}</p>
      <div className="w-14 h-14 mx-auto rounded-full bg-canopy/20 flex items-center justify-center text-2xl mb-3">
        {entry.avatar}
      </div>
      <p className="font-display font-bold text-mist truncate">{entry.username}</p>
      {isCurrentUser && <p className="text-[10px] uppercase tracking-widest text-bio mt-1">You</p>}
      <p className="text-gradient font-display text-2xl font-bold mt-3">{entry.score}</p>
      <p className="text-xs text-mist/50 mt-1">{entry.accuracy}% accuracy</p>
    </GlassCard>
  );
}

function RankRow({ entry, isCurrentUser }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
        isCurrentUser ? "bg-canopy/15 border border-canopy/40" : "hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="w-8 text-center font-mono text-mist/50 text-sm">{entry.rank}</span>
        <span className="w-9 h-9 rounded-full bg-canopy/10 flex items-center justify-center text-lg">
          {entry.avatar}
        </span>
        <div>
          <p className="text-sm font-semibold text-mist">
            {entry.username} {isCurrentUser && <span className="text-bio text-xs ml-1">(You)</span>}
          </p>
          <p className="text-xs text-mist/40">{entry.accuracy}% accuracy</p>
        </div>
      </div>
      <p className="font-display font-bold text-bio">{entry.score}</p>
    </div>
  );
}
