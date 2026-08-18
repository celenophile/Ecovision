import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import questions from "../data/questions";
import { confettiBurst } from "../components/confettiBurst";
import { submitScore } from "../api";
import { socket } from "../socket";

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export default function Game() {
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const session = useGameStore((s) => s.session);
  const saveResult = useGameStore((s) => s.saveResult);

  const isMulti = session.mode === "multi_host" || session.mode === "multi_player";
  const roomCode = session.roomCode;

  // Single-player setup
  const gameQuestions = useMemo(
    () => shuffle(questions).slice(0, session.questionCount || (isMulti ? 10 : 5)),
    [session.questionCount, isMulti]
  );

  const [index, setIndex] = useState(0);
  const [players, setPlayers] = useState(() =>
    (session.participants?.length
      ? session.participants
      : user
      ? [{ id: user.id, username: user.username, avatar: user.avatar || "🌱" }]
      : []
    ).map((p) => ({
      ...p,
      score: 0,
      correct: 0,
      answered: 0,
      streak: 0,
      bestCombo: 0,
    }))
  );

  const [revealed, setRevealed] = useState(false);
  const [blur, setBlur] = useState(20);
  const [wrong, setWrong] = useState([]);
  const [points, setPoints] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Timers
  const [singleTimer, setSingleTimer] = useState(30); // 30s per question for single player
  const [multiMatchTimer, setMultiMatchTimer] = useState(60); // 60s total match timer for multiplayer

  const current = gameQuestions[index];
  const me = players.find((p) => p.id === (user?.id || "")) || players[0];
  const options = useMemo(() => (current ? shuffle(current.options) : []), [current, index]);

  useEffect(() => {
    if (!user) navigate("/register");
  }, [user, navigate]);

  // SINGLE-PLAYER QUESTION TIMER (30 Seconds with Auto-Timeout)
  useEffect(() => {
    if (isMulti || revealed || !current) return;

    setSingleTimer(30);
    const interval = setInterval(() => {
      setSingleTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSingleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [index, revealed, isMulti, current]);

  // Handle 30-second timeout for single-player mode
  const handleSingleTimeout = () => {
    setRevealed(true);
    setBlur(0);
    setFeedbackMsg("⏱️ Time's Up!");
    setPlayers((all) =>
      all.map((p) =>
        p.id === me.id ? { ...p, answered: p.answered + 1, streak: 0 } : p
      )
    );
  };

  // MULTIPLAYER SOCKET LISTENERS & 60s MATCH TIMER
  useEffect(() => {
    if (!isMulti || !roomCode) return;

    const handleTimerTick = ({ matchTimeRemaining }) => {
      setMultiMatchTimer(matchTimeRemaining);
    };

    const handleRoomUpdated = (room) => {
      setPlayers(room.participants);
    };

    const handleLiveLeaderboard = (rankings) => {
      setPlayers(rankings);
    };

    const handleQuestionChanged = ({ currentQuestionIndex }) => {
      setIndex(currentQuestionIndex);
      setRevealed(false);
      setBlur(20);
      setWrong([]);
      setPoints(0);
      setFeedbackMsg("");
    };

    const handleGameOver = ({ room, rankings }) => {
      const finalPlayers = rankings || room.participants;
      const primary = finalPlayers.find((p) => p.id === user?.id) || finalPlayers[0];
      const resultData = {
        players: finalPlayers,
        primary,
        questionCount: room.totalQuestions || gameQuestions.length,
        mode: "multiplayer",
        roomCode: room.roomCode,
      };

      saveResult(resultData);
      navigate("/results");
    };

    socket.on("timer_tick", handleTimerTick);
    socket.on("room_updated", handleRoomUpdated);
    socket.on("live_leaderboard", handleLiveLeaderboard);
    socket.on("question_changed", handleQuestionChanged);
    socket.on("game_over", handleGameOver);

    return () => {
      socket.off("timer_tick", handleTimerTick);
      socket.off("room_updated", handleRoomUpdated);
      socket.off("live_leaderboard", handleLiveLeaderboard);
      socket.off("question_changed", handleQuestionChanged);
      socket.off("game_over", handleGameOver);
    };
  }, [isMulti, roomCode, user, navigate, saveResult, gameQuestions.length]);

  if (!user || !current || !me) return null;

  const accuracy = me.answered ? Math.round((me.correct / me.answered) * 100) : 0;

  // Single-player choice logic
  const handleSingleChoose = (option) => {
    if (revealed || wrong.includes(option)) return;

    if (option === current.answer) {
      const speedBonus = Math.max(0, singleTimer * 4);
      const combo = me.streak + 1;
      const earned = 100 + speedBonus + combo * 10;
      setPoints(earned);
      setFeedbackMsg(`✨ Correct! +${earned} pts`);

      setPlayers((all) =>
        all.map((p) =>
          p.id === me.id
            ? {
                ...p,
                score: p.score + earned,
                correct: p.correct + 1,
                answered: p.answered + 1,
                streak: combo,
                bestCombo: Math.max(p.bestCombo, combo),
              }
            : p
        )
      );

      setRevealed(true);
      [15, 10, 5, 0].forEach((val, n) => setTimeout(() => setBlur(val), (n + 1) * 200));
      confettiBurst();
    } else {
      setWrong((all) => [...all, option]);
      setFeedbackMsg("❌ Wrong! -10 pts penalty");
      setPlayers((all) =>
        all.map((p) =>
          p.id === me.id ? { ...p, score: Math.max(0, p.score - 10), streak: 0 } : p
        )
      );
    }
  };

  // Multiplayer choice logic via Socket.IO
  const handleMultiChoose = (option) => {
    if (revealed || wrong.includes(option)) return;

    socket.emit(
      "submit_answer",
      { roomCode, questionIndex: index, answer: option },
      (res) => {
        if (res.alreadyAnswered) return;

        if (res.correct) {
          setPoints(res.pointsEarned);
          setFeedbackMsg(`✨ Correct! +${res.pointsEarned} pts`);
          setRevealed(true);
          setBlur(0);
          confettiBurst();
        } else {
          setWrong((all) => [...all, option]);
          setFeedbackMsg("❌ Wrong choice! Penalty -10 pts");
        }
      }
    );
  };

  const choose = (option) => {
    if (isMulti) {
      handleMultiChoose(option);
    } else {
      handleSingleChoose(option);
    }
  };

  const skipSingle = () => {
    setWrong(current.options.filter((o) => o !== current.answer));
    setFeedbackMsg("Skipped product");
    setPlayers((all) =>
      all.map((p) =>
        p.id === me.id ? { ...p, answered: p.answered + 1, streak: 0 } : p
      )
    );
    setRevealed(true);
    setBlur(0);
  };

  const nextSingle = async () => {
    if (index + 1 < gameQuestions.length) {
      setIndex(index + 1);
      setRevealed(false);
      setBlur(20);
      setWrong([]);
      setPoints(0);
      setFeedbackMsg("");
      return;
    }

    const primary = players[0];
    const resultData = {
      players,
      primary,
      questionCount: gameQuestions.length,
      mode: "single",
    };

    saveResult(resultData);

    try {
      await submitScore({
        userId: me.id,
        username: me.username,
        avatar: me.avatar,
        score: me.score,
        correct: me.correct,
        total: me.answered,
        bestCombo: me.bestCombo,
      });
    } catch {
      /* Works offline */
    }

    navigate("/results");
  };

  const nextMultiHost = () => {
    socket.emit("next_question", { roomCode });
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Live Multiplayer Header / Participant Banner */}
        {isMulti && (
          <div className="glass rounded-2xl p-3 mb-4 flex items-center justify-between overflow-x-auto gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-canopy/20 text-canopy font-mono font-bold text-xs">
                Room: {roomCode}
              </span>
              <span className="text-xs text-mist/60 font-mono">
                Match Time: <strong className="text-bio text-sm">{multiMatchTimer}s</strong>
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {players.map((p, i) => (
                <span
                  key={p.id}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-all ${
                    p.id === me.id
                      ? "bg-canopy text-void font-bold shadow-glow"
                      : "bg-white/[0.05] text-mist/75"
                  }`}
                >
                  #{i + 1} {p.avatar} {p.username}: <strong>{p.score} pts</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <Stat label="Your Score" value={me.score} accent="text-gradient" />
          <Stat label="Combo Streak" value={`${me.streak}×`} accent="text-spore" />
          <Stat label="Accuracy" value={`${accuracy}%`} accent="text-bio" />
          <Stat
            label={isMulti ? "Match Timer" : "Question Timer"}
            value={isMulti ? `${multiMatchTimer}s` : `${singleTimer}s`}
            accent={!isMulti && singleTimer <= 5 ? "text-red-400 animate-pulse" : "text-mist"}
          />
          <Stat label="Question" value={`${index + 1}/${gameQuestions.length}`} accent="text-gradient" />
        </div>

        {/* Question Progress Bar */}
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-7">
          <div
            className="h-full bg-gradient-to-r from-canopy to-spore transition-all duration-500"
            style={{ width: `${((index + 1) / gameQuestions.length) * 100}%` }}
          />
        </div>

        {/* Main Challenge Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Blurred Product Image & Reveal */}
          <GlassCard
            strong
            glow={revealed}
            className="p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[390px]"
          >
            <span className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-widest text-bio px-2.5 py-1 rounded-full bg-canopy/15 border border-canopy/30">
              {current.category}
            </span>

            {feedbackMsg && (
              <span className="absolute top-4 right-4 text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-mist">
                {feedbackMsg}
              </span>
            )}

            <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden border border-white/10 bg-void my-4">
              <img
                src={current.image}
                alt={revealed ? current.name : "Blurred mystery eco product"}
                className="w-full h-full object-cover transition-[filter] duration-200 ease-out"
                style={{ filter: `blur(${blur}px) saturate(${revealed ? 1 : 0.55})` }}
              />
            </div>

            {revealed && (
              <div className="mt-2 text-center animate-risein">
                <p className="font-display text-2xl font-bold text-gradient">{current.name}</p>
                <p className="text-sm text-mist/70 mt-2 max-w-sm leading-relaxed">
                  {current.explanation}
                </p>
              </div>
            )}
          </GlassCard>

          {/* Right Column: Clues & Multiple Choice Options */}
          <div className="flex flex-col gap-5">
            <GlassCard className="p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-bio mb-4">
                Plastic-Free Living Clues
              </p>
              <ul className="space-y-2.5">
                {current.clues.map((clue) => (
                  <li key={clue} className="clue-line text-sm text-mist/80 leading-relaxed flex items-start gap-2">
                    <span className="text-canopy font-bold">•</span>
                    <span>{clue}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-bio mb-4">
                {revealed ? "Product revealed" : "Choose the sustainable product"}
              </p>

              <div className="grid gap-3">
                {options.map((option) => {
                  const isCorrect = option === current.answer;
                  const isWrong = wrong.includes(option);
                  return (
                    <button
                      key={option}
                      disabled={revealed || isWrong}
                      onClick={() => choose(option)}
                      className={`text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                        revealed && isCorrect
                          ? "border-canopy bg-canopy/20 text-bio font-bold"
                          : isWrong
                          ? "border-red-500/40 bg-red-500/10 text-red-200 opacity-60 line-through"
                          : "border-white/10 hover:border-canopy/50 hover:bg-white/[.04]"
                      }`}
                    >
                      {option}
                      {revealed && isCorrect && <span className="float-right text-canopy">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5">
                {!isMulti ? (
                  !revealed ? (
                    <button
                      onClick={skipSingle}
                      className="flex-1 py-3.5 rounded-xl border border-white/10 text-mist/60 hover:text-mist hover:border-white/30 transition-all text-sm font-medium"
                    >
                      Skip Product
                    </button>
                  ) : (
                    <button
                      onClick={nextSingle}
                      className="eco-btn flex-1 py-3.5 rounded-xl bg-canopy text-void font-display font-bold text-base hover:shadow-glow transition-all"
                    >
                      {index + 1 === gameQuestions.length ? "See Results →" : "Next Product →"}
                    </button>
                  )
                ) : (
                  session.isHost && (
                    <button
                      onClick={nextMultiHost}
                      className="eco-btn w-full py-3.5 rounded-xl bg-canopy text-void font-display font-bold text-base hover:shadow-glow transition-all"
                    >
                      {index + 1 === gameQuestions.length ? "Finish Match →" : "Next Question (Host) →"}
                    </button>
                  )
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <GlassCard className="px-3 py-3 text-center">
      <p className={`font-display font-bold text-lg ${accent}`}>{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-mist/50 mt-1">{label}</p>
    </GlassCard>
  );
}
