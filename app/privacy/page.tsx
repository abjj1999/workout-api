import type { Metadata } from "next";

import { brand, styles } from "../_brand";

export const metadata: Metadata = {
  title: "IRONLOG — Privacy Policy",
  description: "How the IRONLOG workout app collects, uses, and protects your data.",
};

const EFFECTIVE_DATE = "July 14, 2026";

export default function PrivacyPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <p style={styles.wordmark}>{brand.name}</p>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.lede}>Effective {EFFECTIVE_DATE}</p>

        <p style={{ ...styles.p, marginTop: 24 }}>
          IRONLOG (&quot;we,&quot; &quot;us&quot;) is a workout-tracking app.
          This policy explains what information the app collects and how it is
          used. We keep this simple: we only collect what the app needs to
          work, and we do not sell your data or use it for advertising.
        </p>

        <h2 style={styles.h2}>Information we collect</h2>
        <div style={styles.card}>
          <p style={styles.p}>
            <strong>Account information.</strong> When you create an account we
            collect your email address through our authentication provider
            (Clerk) so you can sign in and access your data across sessions.
          </p>
          <p style={styles.p}>
            <strong>Workout data.</strong> The exercises, sets, weights, reps,
            routines, and workout notes you log in the app.
          </p>
          <p style={{ ...styles.p, margin: 0 }}>
            <strong>Body measurements.</strong> Body-weight entries you choose
            to record.
          </p>
        </div>

        <h2 style={styles.h2}>How we use it</h2>
        <p style={styles.p}>
          Your information is used solely to provide the app&apos;s features:
          saving and syncing your workouts, showing your history and progress,
          and keeping you signed in. We do not sell, rent, or share your
          personal data with third parties for marketing.
        </p>

        <h2 style={styles.h2}>Where your data is stored</h2>
        <p style={styles.p}>
          Data is stored securely using trusted service providers: account and
          authentication through Clerk, and your workout and body-weight data
          in a Supabase (PostgreSQL) database. Access is restricted to your
          authenticated account.
        </p>

        <h2 style={styles.h2}>Data retention and deletion</h2>
        <p style={styles.p}>
          Your data is kept while your account is active. You can request
          deletion of your account and all associated data at any time by
          emailing us at the address below, and we will remove it.
        </p>

        <h2 style={styles.h2}>Children</h2>
        <p style={styles.p}>
          IRONLOG is not directed to children under 13, and we do not knowingly
          collect information from them.
        </p>

        <h2 style={styles.h2}>Changes to this policy</h2>
        <p style={styles.p}>
          We may update this policy from time to time. Material changes will be
          reflected by updating the effective date above.
        </p>

        <h2 style={styles.h2}>Contact</h2>
        <p style={styles.p}>
          Questions about your privacy or a deletion request? Email{" "}
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
