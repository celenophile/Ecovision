import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import { socket } from "../socket";

const AVATARS = ["🌱", "🌿", "🍃", "🌳", "🌍", "🐝", "🦋", "🌻"];

export default function JoinRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const setUser = useGameStore((s) => s.setUser);
  const setSession = useGameStore((s) => s.setSession);

  const [roomCode, setRoomCode] = useState(() => (searchParams.get("room") || "").toUpperCase());
  const [username, setUsername] = useState(() => (user ? user.username : ""));
  const [avatar, setAvatar] = useState(() => (user ? user.avatar : "🌱"));
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const handleRoomUpdated = (updatedRoom) => {
      setJoinedRoom(updatedRoom);
    };

    const handleGameStarted = ({ room }) => {
      setSession({
        mode: "multi_player",
        roomCode: room.roomCode,
        isHost: false,
        questionCount: room.totalQuestions,
        participants: room.participants,
      });
      navigate("/game");
    };

    socket.on("room_updated", handleRoomUpdated);
    socket.on("game_started", handleGameStarted);

    return () => {
      socket.off("room_updated", handleRoomUpdated);
      socket.off("game_started", handleGameStarted);
    };
  }, [navigate, setSession]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError("Please enter a 6-character room code.");
      return;
    }
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setError("");
    setIsJoining(true);

    const currentUser = {
      id: user ? user.id : `player-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username: username.trim(),
      avatar,
    };

    if (!user) {
      setUser(currentUser);
    }

    socket.emit("join_room", { roomCode: roomCode.trim(), user: currentUser }, (res) => {
      setIsJoining(false);
      if (res.error) {
        setError(res.error);
      } else {
        setJoinedRoom(res.room);
      }
    });
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-8 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <GlassCard strong glow className="p-8 sm:p-10 animate-risein">
          <div className="text-center mb-6">
            <span className="text-4xl">📱</span>
            <h1 className="font-display text-3xl font-bold mt-2">Join Multiplayer Game</h1>
            <p className="text-mist/60 text-sm mt-1">
              Enter room code or scan host's QR code to play live!
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {!joinedRoom ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-bio block mb-1.5">
                  Room Code
                </label>
                <input
                  type="text"
                  maxLength={7}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ECO4821"
                  className="eco-input text-center text-2xl font-mono tracking-widest uppercase font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-bio block mb-1.5">
                  Your Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="eco-input"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-bio block mb-1.5">
                  Pick Avatar
                </label>
                <div className="flex flex-wrap gap-2 justify-center py-1">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`text-2xl p-2 rounded-xl border transition-all ${
                        avatar === emoji
                          ? "border-canopy bg-canopy/20 scale-110 shadow-glow"
                          : "border-white/10 hover:border-canopy/40"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="eco-btn w-full py-4 rounded-2xl bg-canopy text-void font-display font-bold text-lg hover:shadow-glow transition-all mt-4"
              >
                {isJoining ? "Joining Room..." : "Join Room →"}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="p-4 rounded-2xl bg-canopy/15 border border-canopy/30 inline-block">
                <p className="text-xs font-mono uppercase tracking-widest text-mist/60">Connected to Room</p>
                <p className="text-3xl font-display font-bold text-canopy tracking-widest mt-1">
                  {joinedRoom.roomCode}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-bio font-semibold text-lg py-2">
                <span className="w-3 h-3 rounded-full bg-canopy animate-ping" />
                ✓ Connected as {avatar} {username}
              </div>

              <p className="text-mist/70 text-sm animate-pulse">
                Waiting for host to start the quiz... Get ready! 🚀
              </p>

              <div className="mt-6 pt-4 border-t border-white/10 text-left">
                <p className="text-xs font-mono uppercase tracking-widest text-mist/50 mb-2">
                  Connected Players ({joinedRoom.participants.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {joinedRoom.participants.map((p) => (
                    <div key={p.id} className="text-sm text-mist/80 flex items-center justify-between">
                      <span>{p.avatar} {p.username} {p.isHost && "(Host)"}</span>
                      <span className="text-bio text-xs">Ready</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
