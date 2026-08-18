import { create } from "zustand";
import { persist } from "zustand/middleware";

const emptyStats = { gamesPlayed: 0, bestScore: 0, correct: 0, answered: 0, bestCombo: 0 };

const useGameStore = create(
  persist(
    (set) => ({
      user: null,
      session: { mode: "single", questionCount: 5, participants: [] },
      lastResult: null,
      profileStats: emptyStats,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, lastResult: null, session: { mode: "single", questionCount: 5, participants: [] } }),
      setSession: (session) => set({ session }),
      saveResult: (lastResult) => set((state) => ({
        lastResult,
        profileStats: {
          gamesPlayed: state.profileStats.gamesPlayed + 1,
          bestScore: Math.max(state.profileStats.bestScore, lastResult.primary.score),
          correct: state.profileStats.correct + lastResult.primary.correct,
          answered: state.profileStats.answered + lastResult.primary.answered,
          bestCombo: Math.max(state.profileStats.bestCombo, lastResult.primary.bestCombo),
        },
      })),
    }),
    { name: "ecovision-storage" }
  )
);

export default useGameStore;
