// Shared IRONLOG brand tokens and inline-style building blocks for the
// public marketing/support pages. Kept self-contained so these pages render
// on-brand regardless of the app's Tailwind theme.

export const brand = {
  name: "IRONLOG",
  tagline: "Train hard. Track everything.",
  supportEmail: "abdullahalhilfi21@gmail.com",
  owner: "Abdullah Al Hilfi",
  year: 2026,
  colors: {
    background: "#131313",
    surface: "#1E1E1E",
    border: "#2A2A2A",
    accent: "#E8590C",
    textPrimary: "#E5E2E1",
    textSecondary: "rgba(255,255,255,0.6)",
  },
} as const;

export const styles = {
  page: {
    minHeight: "100vh",
    background: brand.colors.background,
    color: brand.colors.textPrimary,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "48px 20px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  container: { width: "100%", maxWidth: 640 },
  wordmark: {
    fontSize: 14,
    letterSpacing: "3px",
    fontWeight: 700,
    color: brand.colors.accent,
    textTransform: "uppercase" as const,
  },
  h1: {
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: "0.5px",
    margin: "8px 0 4px",
  },
  lede: { color: brand.colors.textSecondary, fontSize: 17, lineHeight: 1.5 },
  h2: {
    fontSize: 13,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    color: brand.colors.textSecondary,
    margin: "32px 0 12px",
  },
  card: {
    background: brand.colors.surface,
    border: `1px solid ${brand.colors.border}`,
    borderRadius: 12,
    padding: 20,
  },
  link: { color: brand.colors.accent, textDecoration: "none", fontWeight: 600 },
  p: { fontSize: 16, lineHeight: 1.6, margin: "0 0 12px" },
  footer: {
    marginTop: 48,
    paddingTop: 20,
    borderTop: `1px solid ${brand.colors.border}`,
    color: brand.colors.textSecondary,
    fontSize: 13,
  },
} as const;
