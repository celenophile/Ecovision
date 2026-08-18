import { store } from "../db.js";

// In-memory room storage
const rooms = new Map();

// Helper to generate a 6-character room code like ECO482
function generateRoomCode() {
  const letters = "ECO";
  const numbers = Math.floor(1000 + Math.random() * 9000).toString();
  return `${letters}${numbers}`;
}

export function setupRoomSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Create a new Multiplayer Room (Host)
    socket.on("create_room", ({ user, questions }, callback) => {
      let roomCode = generateRoomCode();
      while (rooms.has(roomCode)) {
        roomCode = generateRoomCode();
      }

      const hostParticipant = {
        socketId: socket.id,
        id: user.id || `host-${Date.now()}`,
        username: user.username,
        avatar: user.avatar || "🌱",
        isHost: true,
        ready: true,
        score: 0,
        correct: 0,
        answered: 0,
        streak: 0,
        bestCombo: 0,
        answers: {},
      };

      const room = {
        roomCode,
        hostSocketId: socket.id,
        status: "lobby", // "lobby" | "playing" | "game_over"
        participants: [hostParticipant],
        questions: questions || [],
        currentQuestionIndex: 0,
        matchTimeRemaining: 60, // 1-minute total match timer for multiplayer
        timerInterval: null,
      };

      rooms.set(roomCode, room);
      socket.join(roomCode);

      console.log(`🏠 Room created: ${roomCode} by ${user.username}`);

      if (typeof callback === "function") {
        callback({ success: true, roomCode, room: sanitizeRoom(room) });
      }
      io.to(roomCode).emit("room_updated", sanitizeRoom(room));
    });

    // Participant Joins a Room
    socket.on("join_room", ({ roomCode, user }, callback) => {
      const code = (roomCode || "").toUpperCase().trim();
      const room = rooms.get(code);

      if (!room) {
        if (typeof callback === "function") callback({ error: "Room not found. Check the room code." });
        return;
      }

      if (room.status !== "lobby") {
        if (typeof callback === "function") callback({ error: "Game has already started." });
        return;
      }

      // Check if participant already exists by id or socket
      let existing = room.participants.find((p) => p.id === user.id || p.socketId === socket.id);
      if (!existing) {
        existing = {
          socketId: socket.id,
          id: user.id || `player-${Date.now()}`,
          username: user.username,
          avatar: user.avatar || "🌿",
          isHost: false,
          ready: true,
          score: 0,
          correct: 0,
          answered: 0,
          streak: 0,
          bestCombo: 0,
          answers: {},
        };
        room.participants.push(existing);
      } else {
        existing.socketId = socket.id;
        existing.ready = true;
      }

      socket.join(code);
      console.log(`👤 User ${user.username} joined room ${code}`);

      if (typeof callback === "function") {
        callback({ success: true, roomCode: code, room: sanitizeRoom(room) });
      }
      io.to(code).emit("room_updated", sanitizeRoom(room));
    });

    // Start Quiz (Host Only)
    socket.on("start_game", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      if (room.hostSocketId !== socket.id) {
        if (typeof callback === "function") callback({ error: "Only the host can start the game." });
        return;
      }

      room.status = "playing";
      room.currentQuestionIndex = 0;
      room.matchTimeRemaining = 60; // 60s total game limit

      // Start 1-minute global countdown timer on server
      if (room.timerInterval) clearInterval(room.timerInterval);

      room.timerInterval = setInterval(async () => {
        room.matchTimeRemaining -= 1;

        if (room.matchTimeRemaining <= 0) {
          clearInterval(room.timerInterval);
          room.timerInterval = null;
          room.status = "game_over";

          // Save final scores for all participants
          await saveRoomScores(room);

          io.to(roomCode).emit("game_over", {
            room: sanitizeRoom(room),
            rankings: getSortedRankings(room),
          });
        } else {
          io.to(roomCode).emit("timer_tick", {
            matchTimeRemaining: room.matchTimeRemaining,
          });
        }
      }, 1000);

      io.to(roomCode).emit("game_started", { room: sanitizeRoom(room) });
      if (typeof callback === "function") callback({ success: true });
    });

    // Submit Answer during multiplayer quiz
    socket.on("submit_answer", ({ roomCode, questionIndex, answer }, callback) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== "playing") return;

      const participant = room.participants.find((p) => p.socketId === socket.id);
      if (!participant) return;

      const currentQ = room.questions[questionIndex];
      if (!currentQ) return;

      // Prevent duplicate scoring for same question
      if (participant.answers[questionIndex] !== undefined) {
        if (typeof callback === "function") {
          callback({ alreadyAnswered: true, score: participant.score });
        }
        return;
      }

      const isCorrect = answer === currentQ.answer;
      participant.answers[questionIndex] = answer;
      participant.answered += 1;

      let pointsEarned = 0;
      if (isCorrect) {
        // Speed bonus calculated using remaining match time (higher bonus for faster answers)
        const speedBonus = Math.min(50, room.matchTimeRemaining);
        const combo = participant.streak + 1;
        pointsEarned = 100 + speedBonus + combo * 10;

        participant.score += pointsEarned;
        participant.correct += 1;
        participant.streak = combo;
        participant.bestCombo = Math.max(participant.bestCombo, combo);
      } else {
        // Penalty for wrong answer (-10 points) & reset streak
        participant.score = Math.max(0, participant.score - 10);
        participant.streak = 0;
      }

      // Live update broadcast to all players in room
      io.to(roomCode).emit("room_updated", sanitizeRoom(room));
      io.to(roomCode).emit("live_leaderboard", getSortedRankings(room));

      if (typeof callback === "function") {
        callback({
          correct: isCorrect,
          pointsEarned,
          score: participant.score,
          streak: participant.streak,
          answer: currentQ.answer,
          explanation: currentQ.explanation,
        });
      }

      // Check if all players answered current question or all questions completed
      checkRoomProgress(io, roomCode, room);
    });

    // Host manually advances to next question
    socket.on("next_question", ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== "playing") return;

      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        io.to(roomCode).emit("question_changed", {
          currentQuestionIndex: room.currentQuestionIndex,
          question: room.questions[room.currentQuestionIndex],
        });
      } else {
        // Game finished before timer run out
        if (room.timerInterval) clearInterval(room.timerInterval);
        room.status = "game_over";
        saveRoomScores(room);
        io.to(roomCode).emit("game_over", {
          room: sanitizeRoom(room),
          rankings: getSortedRankings(room),
        });
      }
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      rooms.forEach((room, code) => {
        const participantIndex = room.participants.findIndex((p) => p.socketId === socket.id);
        if (participantIndex !== -1) {
          // If host disconnects, pass host or destroy room if empty
          if (room.participants[participantIndex].isHost) {
            room.participants.splice(participantIndex, 1);
            if (room.participants.length > 0) {
              room.participants[0].isHost = true;
              room.hostSocketId = room.participants[0].socketId;
            } else {
              if (room.timerInterval) clearInterval(room.timerInterval);
              rooms.delete(code);
              return;
            }
          } else {
            room.participants.splice(participantIndex, 1);
          }
          io.to(code).emit("room_updated", sanitizeRoom(room));
        }
      });
    });
  });
}

function sanitizeRoom(room) {
  return {
    roomCode: room.roomCode,
    status: room.status,
    participants: room.participants.map((p) => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      isHost: p.isHost,
      ready: p.ready,
      score: p.score,
      correct: p.correct,
      answered: p.answered,
      streak: p.streak,
      bestCombo: p.bestCombo,
    })),
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    matchTimeRemaining: room.matchTimeRemaining,
  };
}

function getSortedRankings(room) {
  return [...room.participants]
    .map((p) => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      correct: p.correct,
      answered: p.answered,
      streak: p.streak,
      bestCombo: p.bestCombo,
    }))
    .sort((a, b) => b.score - a.score);
}

async function checkRoomProgress(io, roomCode, room) {
  const currentIdx = room.currentQuestionIndex;
  const allAnswered = room.participants.every((p) => p.answers[currentIdx] !== undefined);

  if (allAnswered) {
    // Delay slightly to let players read feedback, then auto-advance
    setTimeout(() => {
      if (room.status !== "playing") return;
      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        io.to(roomCode).emit("question_changed", {
          currentQuestionIndex: room.currentQuestionIndex,
          question: room.questions[room.currentQuestionIndex],
        });
      } else {
        if (room.timerInterval) clearInterval(room.timerInterval);
        room.status = "game_over";
        saveRoomScores(room);
        io.to(roomCode).emit("game_over", {
          room: sanitizeRoom(room),
          rankings: getSortedRankings(room),
        });
      }
    }, 2000);
  }
}

async function saveRoomScores(room) {
  for (const p of room.participants) {
    if (!p.id.startsWith("guest-")) {
      try {
        await store.saveScore({
          userId: p.id,
          username: p.username,
          avatar: p.avatar,
          score: p.score,
          correct: p.correct,
          total: p.answered,
          accuracy: p.answered > 0 ? Math.round((p.correct / p.answered) * 100) : 0,
          bestCombo: p.bestCombo,
        });
      } catch (e) {
        console.error(`Failed to save score for ${p.username}:`, e.message);
      }
    }
  }
}
