/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0C0A09",
        foreground: "#FAFAF9",
        obsidian: {
          bg: "#0C0A09",
          surface: "#18120F",
          elevated: "#211712",
          border: "#3A2720",
        },
        card: {
          DEFAULT: "#18120F",
          foreground: "#FAFAF9",
        },
        popover: {
          DEFAULT: "#211712",
          foreground: "#FAFAF9",
        },
        primary: {
          DEFAULT: "#F97316",
          bright: "#FB923C",
          active: "#EA580C",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#211712",
          foreground: "#D6D3D1",
        },
        amber: {
          DEFAULT: "#FBBF24",
          bright: "#FDE047",
        },
        muted: {
          DEFAULT: "#211712",
          foreground: "#A8A29E",
        },
        accent: {
          DEFAULT: "#F97316",
          amber: "#FBBF24",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FBBF24",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#3A2720",
        input: "#18120F",
        ring: "#F97316",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "orange-amber": "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)",
        "obsidian-gradient": "linear-gradient(180deg, #18120F 0%, #0C0A09 100%)",
        "glow-orange": "radial-gradient(circle at center, rgba(249, 115, 22, 0.12) 0%, transparent 60%)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.6)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.03)",
        "glow": "0 0 20px 2px rgba(249, 115, 22, 0.2)",
        "amber-glow": "0 0 20px 2px rgba(251, 191, 36, 0.2)",
      },
    },
  },
  plugins: [],
};
