import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        "input-background": "var(--input-background)",
        ring: "var(--ring)",
        background: "var(--background)",
        "background-mid": "var(--background-mid)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        gold: "var(--gold)",
        amber: "var(--amber)",
        "orange-glow": "var(--orange-glow)",
        "purple-energy": "var(--purple-energy)",
        "red-aura": "var(--red-aura)",
        "green-success": "var(--green-success)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        ember: "0 0 30px rgba(255, 136, 0, 0.4)",
        "ember-lg": "0 0 50px rgba(255, 136, 0, 0.18)",
        glass: "0 18px 80px rgba(0, 0, 0, 0.42)",
        premium: "0 0 30px rgba(170, 68, 255, 0.35)",
      },
      backgroundImage: {
        "zen-radial":
          "radial-gradient(ellipse at center, rgba(255,136,0,0.05) 0%, transparent 70%)",
        "zen-page": "linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 48%, #1a1a1a 100%)",
        "zen-cta": "linear-gradient(90deg, #ff8800 0%, #ff6600 100%)",
        "zen-title": "linear-gradient(90deg, #ffaa00 0%, #ff8800 52%, #ff6600 100%)",
        "premium": "linear-gradient(135deg, rgba(170,68,255,0.22) 0%, rgba(255,136,0,0.16) 100%)",
      },
      fontFamily: {
        display: ["SANSON", "var(--font-geist-sans)", "Inter", "Manrope", "system-ui", "sans-serif"],
        body: ["var(--font-geist-sans)", "Inter", "Manrope", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "Inter", "Manrope", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.25rem, 9vw, 7.5rem)", { lineHeight: "0.86", letterSpacing: "0.045em" }],
        "display-lg": ["clamp(2.45rem, 6vw, 5.25rem)", { lineHeight: "0.94", letterSpacing: "0.035em" }],
        "heading-xl": ["clamp(2rem, 4vw, 3.65rem)", { lineHeight: "1.02", letterSpacing: "0.025em" }],
        "heading-lg": ["clamp(1.55rem, 2.8vw, 2.45rem)", { lineHeight: "1.08", letterSpacing: "0.018em" }],
        "body-lg": ["clamp(1rem, 1.5vw, 1.125rem)", { lineHeight: "1.75", letterSpacing: "0" }],
        body: ["0.95rem", { lineHeight: "1.65", letterSpacing: "0" }],
        caption: ["0.75rem", { lineHeight: "1.35", letterSpacing: "0.08em" }],
      },
    },
  },
  plugins: [],
};

export default config;
