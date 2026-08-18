import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useGameStore from "../store/useGameStore";
import { registerUser } from "../api";

const AGE_GROUPS = ["Under 13", "13–17", "18–24", "25–34", "35–49", "50+"];

export default function Register() {
  const navigate = useNavigate();
  const setUser = useGameStore((s) => s.setUser);

  const [form, setForm] = useState({ name: "", username: "", email: "", ageGroup: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) e.username = "3–20 letters, numbers, underscores.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.ageGroup) e.ageGroup = "Select an age group.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const { user } = await registerUser(form);
      setUser(user);
      navigate("/how-to-play");
    } catch (err) {
      setApiError(
        err?.response?.data?.error ||
          "Couldn't reach the EcoVision server. Make sure the backend is running on http://localhost:5000."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
      <GlassCard strong glow className="w-full max-w-lg p-8 sm:p-10 animate-risein">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="font-display text-3xl font-bold text-mist">Join EcoVision</h1>
          <p className="text-mist/60 text-sm mt-2">Create your eco-profile to start the identification challenge.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Full Name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Asha Rao"
              className="eco-input"
            />
          </Field>

          <Field label="Username" error={errors.username}>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              placeholder="eco_asha"
              className="eco-input"
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="asha@example.com"
              className="eco-input"
            />
          </Field>

          <Field label="Age Group" error={errors.ageGroup}>
            <div className="grid grid-cols-3 gap-2">
              {AGE_GROUPS.map((ag) => (
                <button
                  type="button"
                  key={ag}
                  onClick={() => update("ageGroup", ag)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.ageGroup === ag
                      ? "bg-canopy/25 border-canopy text-bio"
                      : "border-white/10 text-mist/60 hover:border-canopy/40 hover:text-mist"
                  }`}
                >
                  {ag}
                </button>
              ))}
            </div>
          </Field>

          {apiError && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="eco-btn w-full py-4 rounded-2xl bg-canopy text-void font-display font-bold text-lg hover:shadow-glowLg transition-all disabled:opacity-60"
          >
            {loading ? "Creating profile…" : "Enter EcoVision →"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-widest text-mist/50 mb-2">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-300 mt-1.5">{error}</span>}
    </label>
  );
}
