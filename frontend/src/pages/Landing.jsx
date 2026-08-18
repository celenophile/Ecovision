import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import { CATEGORIES } from "../data/questions";

const features = [
  { icon: "🖼️", title: "Blurred Reveals", text: "Guess the sustainable product hidden behind a heavy blur, then watch it sharpen as you succeed." },
  { icon: "🧩", title: "Clue-Based Play", text: "Four keyword clues nudge you toward the answer without ever naming the product." },
  { icon: "⚡", title: "Combo Scoring", text: "Fast answers and consecutive streaks multiply your score for maximum eco-points." },
  { icon: "🏆", title: "Live Leaderboard", text: "Climb the global ranks and see exactly where you stand against other players." },
];

export default function Landing() {
  const user = useGameStore((s) => s.user);

  return (
    <div className="relative pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto animate-risein">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-mono tracking-widest uppercase text-bio mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-canopy animate-pulseGlow" />
            30+ eco products · live global leaderboard
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight">
            See Beyond
            <br />
            <span className="shimmer-text">Plastic.</span>
          </h1>
          <p className="mt-6 text-lg text-mist/70 leading-relaxed">
            EcoVision is a 3D gamified identification challenge. Decode blurred clues, unmask
            reusable, biodegradable and zero-waste products, and race up the sustainability
            leaderboard.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={user ? "/how-to-play" : "/register"}
              className="eco-btn px-8 py-4 rounded-2xl bg-canopy text-void font-display font-bold text-lg hover:shadow-glowLg transition-all hover:-translate-y-0.5"
            >
              {user ? `Play as ${user.username} →` : "Start Playing →"}
            </Link>
            <Link
              to="/how-to-play"
              className="px-8 py-4 rounded-2xl glass font-semibold text-mist/90 hover:text-mist hover:shadow-glow transition-all"
            >
              How it Works
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-24">
          {features.map((f, i) => (
            <GlassCard
              key={f.title}
              className="p-6 hover:shadow-glow transition-all hover:-translate-y-1 animate-risein"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-mist mb-1.5">{f.title}</h3>
              <p className="text-sm text-mist/60 leading-relaxed">{f.text}</p>
            </GlassCard>
          ))}
        </div>

        {/* Categories */}
        <GlassCard strong className="mt-20 p-8 sm:p-10">
          <p className="text-xs font-mono uppercase tracking-widest text-bio mb-4">Explore categories</p>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 rounded-xl border border-canopy/30 bg-canopy/10 text-sm text-mist/85 font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mt-8 text-center">
            <div>
              <p className="text-3xl font-display font-bold text-gradient">32</p>
              <p className="text-xs text-mist/60 mt-1">Products to Identify</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-gradient">6</p>
              <p className="text-xs text-mist/60 mt-1">Sustainable Categories</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-gradient">∞</p>
              <p className="text-xs text-mist/60 mt-1">Combo Potential</p>
            </div>
          </div>
        </GlassCard>

        {/* CTA footer */}
        <div className="text-center mt-20">
          <p className="text-mist/50 text-sm">
            Discover a sustainable future — one identified product at a time. 🌱
          </p>
        </div>
      </div>
    </div>
  );
}
