import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE_URL });

export async function registerUser(payload) {
  const { data } = await api.post("/users/register", payload);
  return data;
}

export async function submitScore(payload) {
  const { data } = await api.post("/scores", payload);
  return data;
}

export async function fetchLeaderboard(limit = 50) {
  const { data } = await api.get(`/leaderboard?limit=${limit}`);
  return data.leaderboard;
}

export default api;
