import type { Metadata } from "next";

import { brand, styles } from "../_brand";

export const metadata: Metadata = {
  title: "IRONLOG — Support",
  description: "Support and contact information for the IRONLOG workout app.",
};

export default function SupportPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <p style={styles.wordmark}>{brand.name}</p>
        <h1 style={styles.h1}>Support</h1>
        <p style={styles.lede}>
          Need help with IRONLOG? We&apos;re happy to assist.
        </p>

        <h2 style={styles.h2}>Contact</h2>
        <div style={styles.card}>
          <p style={styles.p}>
            Email us and we&apos;ll get back to you as soon as we can:
          </p>
          <p style={{ ...styles.p, margin: 0 }}>
            <a style={styles.link} href={`mailto:${brand.supportEmail}`}>
              {brand.supportEmail}
            </a>
          </p>
        </div>

        <h2 style={styles.h2}>Common questions</h2>
        <div style={styles.card}>
          <p style={styles.p}>
            <strong>How do I log a workout?</strong>
            <br />
            Open the Today tab, tap Start New Session, choose your exercises,
            and log weight and reps for each set. Tap Finish Workout when
            you&apos;re done.
          </p>
          <p style={styles.p}>
            <strong>Where is my workout history?</strong>
            <br />
            Finished workouts are saved to the History tab, where you can open
            any session to see a full set-by-set breakdown.
          </p>
          <p style={{ ...styles.p, margin: 0 }}>
            <strong>Can I use kilograms instead of pounds?</strong>
            <br />
            Yes. Open the Profile tab and switch the weight unit in Settings.
          </p>
        </div>

        <footer style={styles.footer}>
          © {brand.year} {brand.owner}. {brand.name} — {brand.tagline}
        </footer>
      </div>
    </main>
  );
}
