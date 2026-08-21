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
        background: "#050505",
        "background-secondary": "#0B0B0B",
        foreground: "#F8FAFC",
        surface: {
          DEFAULT: "#111111",
          elevated: "#171717",
          border: "#27272A",
        },
        card: {
          DEFAULT: "#111111",
          foreground: "#F8FAFC",
        },
        popover: {
          DEFAULT: "#171717",
          foreground: "#F8FAFC",
        },
        primary: {
          DEFAULT: "#E11D48",
          bright: "#F43F5E",
          deep: "#9F1239",
          foreground: "#FFFFFF",
        },
        crimson: {
          DEFAULT: "#E11D48",
          bright: "#F43F5E",
          deep: "#9F1239",
          glow: "rgba(225, 29, 72, 0.25)",
        },
        secondary: {
          DEFAULT: "#171717",
          foreground: "#CBD5E1",
        },
        muted: {
          DEFAULT: "#171717",
          foreground: "#94A3B8",
        },
        accent: {
          DEFAULT: "#E11D48",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#60A5FA",
          foreground: "#FFFFFF",
        },
        border: "#27272A",
        input: "#111111",
        ring: "#E11D48",
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
        "crimson-gradient": "linear-gradient(135deg, #E11D48 0%, #9F1239 100%)",
        "carbon-gradient": "linear-gradient(180deg, #111111 0%, #050505 100%)",
        "glow-crimson": "radial-gradient(circle at center, rgba(225, 29, 72, 0.15) 0%, transparent 65%)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.8)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
        "glow": "0 0 24px 2px rgba(225, 29, 72, 0.3)",
        "crimson-glow": "0 0 30px 4px rgba(225, 29, 72, 0.35)",
      },
    },
  },
  plugins: [],
};
