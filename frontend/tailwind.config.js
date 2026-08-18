/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#03110a",
        abyss: "#061c12",
        moss: "#0e2f1f",
        canopy: "#12c48b",
        canopyDim: "#0d8f66",
        spore: "#c9f95c",
        bio: "#7cf6d0",
        bark: "#8a6b4a",
        mist: "#dff7ea",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(18, 196, 139, 0.35)",
        glowLg: "0 0 80px rgba(18, 196, 139, 0.25)",
        spore: "0 0 30px rgba(201, 249, 92, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0) translateX(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) translateX(10px) rotate(8deg)" },
          "100%": { transform: "translateY(0) translateX(0) rotate(0deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        risein: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        drift: "drift 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        risein: "risein 0.6s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
