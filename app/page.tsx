import Link from "next/link";

import { brand, styles } from "./_brand";

export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <p style={styles.wordmark}>{brand.name}</p>
        <h1 style={styles.h1}>{brand.tagline}</h1>
        <p style={styles.lede}>
          A dark, distraction-free workout tracker for iOS.
        </p>

        <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
          <Link style={styles.link} href="/marketing">
            About →
          </Link>
          <Link style={styles.link} href="/support">
            Support →
          </Link>
        </div>

        <footer style={styles.footer}>
          © {brand.year} {brand.owner}. {brand.name}
        </footer>
      </div>
    </main>
  );
}
