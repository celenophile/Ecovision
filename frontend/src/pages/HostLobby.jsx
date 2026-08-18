import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import { socket } from "../socket";
import questions from "../data/questions";

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export default function HostLobby() {
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const setSession = useGameStore((s) => s.setSession);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/register");
      return;
    }

    const shuffledQuestions = shuffle(questions).slice(0, 10);

    // Request host room creation
    socket.emit("create_room", { user, questions: shuffledQuestions }, (res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setRoomData(res.room);
      }
    });

    const handleRoomUpdated = (updatedRoom) => {
      setRoomData(updatedRoom);
    };

    const handleGameStarted = ({ room }) => {
      setSession({
        mode: "multi_host",
        roomCode: room.roomCode,
        isHost: true,
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
  }, [user, navigate, setSession]);

  const handleStartQuiz = () => {
    if (!roomData) return;
    socket.emit("start_game", { roomCode: roomData.roomCode }, (res) => {
      if (res && res.error) {
        setError(res.error);
      }
    });
  };

  if (!user) return null;

  const joinUrl = roomData
    ? `${window.location.origin}/join?room=${roomData.roomCode}`
    : `${window.location.origin}/join`;

  return (
    <div className="pt-28 pb-20 px-4 sm:px-8 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto">
        <GlassCard strong glow className="p-8 sm:p-10 text-center animate-risein">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-mono tracking-widest uppercase text-bio mb-4">
            <span className="w-2 h-2 rounded-full bg-canopy animate-pulse" />
            Host Multiplayer Lobby
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gradient">
            ECO-VISION
          </h1>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
              {error}
            </div>
          )}

          {roomData ? (
            <div className="mt-6 grid md:grid-cols-2 gap-8 items-center">
              {/* QR Code & Room Code Section */}
              <div className="flex flex-col items-center glass p-6 rounded-2xl border border-canopy/30">
                <p className="text-xs font-mono uppercase tracking-widest text-mist/60 mb-1">Room Code</p>
                <div className="text-4xl font-display font-extrabold text-canopy tracking-wider my-2 bg-canopy/10 px-6 py-2 rounded-xl border border-canopy/40">
                  {roomData.roomCode}
                </div>

                <div className="p-4 bg-white rounded-2xl shadow-lg my-4 border-4 border-canopy/20">
                  <QRCodeSVG value={joinUrl} size={160} level="H" includeMargin={false} />
                </div>

                <p className="text-xs text-mist/60 max-w-xs leading-relaxed">
                  Scan QR code or open <span className="text-bio font-mono">{joinUrl}</span> on your mobile device to join!
                </p>
              </div>

              {/* Participant List */}
              <div className="flex flex-col h-full justify-between glass p-6 rounded-2xl border border-white/10">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <span className="font-display font-semibold text-mist text-lg">Players Joined</span>
                    <span className="px-3 py-1 bg-canopy/20 text-bio rounded-full font-mono text-sm font-bold">
                      {roomData.participants.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-left">
                    {roomData.participants.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{player.avatar}</span>
                          <span className="font-medium text-mist">
                            {player.username} {player.isHost && "(Host)"}
                          </span>
                        </div>
                        <span className="text-bio font-semibold text-sm flex items-center gap-1">
                          ✓ Ready
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartQuiz}
                  disabled={roomData.participants.length === 0}
                  className="eco-btn w-full mt-6 py-4 rounded-2xl bg-canopy text-void font-display font-bold text-lg hover:shadow-glow transition-all"
                >
                  Start Quiz →
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-mist/60 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-canopy border-t-transparent rounded-full animate-spin" />
              Creating game room...
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
