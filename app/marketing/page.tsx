import type { Metadata } from "next";

import { brand, styles } from "../_brand";

export const metadata: Metadata = {
  title: "IRONLOG — Track every set. See yourself progress.",
  description:
    "IRONLOG is a dark, distraction-free workout tracker: log every set, browse 1,300+ exercises, and watch your progress over time.",
};

const features: { title: string; body: string }[] = [
  {
    title: "Track every set",
    body: "Log weight and reps the moment you finish a set, check them off, and edit anything mid-session.",
  },
  {
    title: "A real exercise library",
    body: "Browse 1,300+ exercises with animated demonstrations and step-by-step instructions, filterable by muscle.",
  },
  {
    title: "See yourself progress",
    body: "Every workout is saved with volume, sets, and duration, plus a set-by-set breakdown and personal records.",
  },
  {
    title: "Body weight tracking",
    body: "Log your body weight and follow your progression on a clean graph over time.",
  },
];

export default function MarketingPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <p style={styles.wordmark}>{brand.name}</p>
        <h1 style={styles.h1}>{brand.tagline}</h1>
        <p style={styles.lede}>
          IRONLOG is a workout tracker for people who are serious about getting
          stronger. No clutter, no social feed — just a fast, focused way to log
          your training and watch your numbers climb.
        </p>

        <h2 style={styles.h2}>What you can do</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {features.map((feature) => (
            <div key={feature.title} style={styles.card}>
              <p style={{ ...styles.p, margin: "0 0 6px", fontWeight: 700 }}>
                {feature.title}
              </p>
              <p style={{ ...styles.p, margin: 0, color: brand.colors.textSecondary }}>
                {feature.body}
              </p>
            </div>
          ))}
        </div>

        <h2 style={styles.h2}>Support</h2>
        <p style={styles.p}>
          Questions? Reach us at{" "}
          <a style={styles.link} href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>
          .
        </p>

        <footer style={styles.footer}>
          © {brand.year} {brand.owner}. {brand.name} — {brand.tagline}
        </footer>
      </div>
    </main>
  );
}
