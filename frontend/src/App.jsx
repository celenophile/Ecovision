import { Routes, Route, useLocation } from "react-router-dom";
import Background3D from "./components/Background3D";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Game from "./pages/Game";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import HowToPlay from "./pages/HowToPlay";
import HostLobby from "./pages/HostLobby";
import JoinRoom from "./pages/JoinRoom";

export default function App() {
  const location = useLocation();
  const dim = location.pathname === "/game";

  return (
    <div className="min-h-screen relative">
      <Background3D dim={dim} />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/host" element={<HostLobby />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/game" element={<Game />} />
          <Route path="/results" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
    </div>
  );
}
