import { Link, useLocation } from "react-router-dom";
import useGameStore from "../store/useGameStore";

const links = [
  { to: "/", label: "Home" },
  { to: "/how-to-play", label: "How to Play" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const location = useLocation();
  const user = useGameStore((s) => s.user);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 pt-4">
      <nav className="glass mx-auto max-w-6xl rounded-2xl px-5 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:animate-drift inline-block">🌍</span>
          <span className="font-display font-bold text-lg tracking-tight text-mist">
            Eco<span className="text-gradient">Vision</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? "bg-canopy/20 text-bio border border-canopy/40"
                  : "text-mist/70 hover:text-mist hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:shadow-glow transition-all"
            >
              <span className="w-8 h-8 rounded-full bg-canopy/20 flex items-center justify-center text-lg">
                {user.avatar}
              </span>
              <span className="text-sm font-medium text-mist hidden sm:inline">{user.username}</span>
            </Link>
          ) : (
            <Link
              to="/register"
              className="eco-btn px-4 py-2 rounded-xl bg-canopy text-void font-semibold text-sm hover:shadow-glow transition-all"
            >
              Get Started
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
