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
        background: "#0A0F1C",
        foreground: "#FFFFFF",
        card: {
          DEFAULT: "#151B2D",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#111827",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#7C3AED",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#111827",
          foreground: "#D1D5DB",
        },
        muted: {
          DEFAULT: "#1F2937",
          foreground: "#9CA3AF",
        },
        accent: {
          DEFAULT: "#6366F1",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.05)",
        ring: "#6366F1",
      },
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
        "glow-gradient": "radial-gradient(circle at center, rgba(124, 58, 237, 0.12) 0%, transparent 60%)",
        "premium-gradient": "linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #3B82F6 100%)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
        "glow": "0 0 20px 2px rgba(99, 102, 241, 0.15)",
        "premium": "0 4px 20px 0 rgba(124, 90, 237, 0.15)",
      },
    },
  },
  plugins: [],
};
