import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <header style={styles.nav}>
        <div style={styles.logo}>Asset 360</div>

        {/* <div style={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#overview">Overview</a>
          <a href="#security">Security</a>
        </div> */}

        <div style={styles.actions}>
          <button onClick={() => navigate("/login")} style={styles.textBtn}>
            Login
          </button>
          <button onClick={() => navigate("/register")} style={styles.primaryBtn}>
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.logo}>Asset 360</h1>
          <h1 style={styles.title}>
            Smart Asset Management
          </h1>

          <p style={styles.subtitle}>
            Track, assign, and manage all your organizational assets from a single
            and centralized system.
          </p>

          <div style={styles.ctaRow}>
            <button
              onClick={() => navigate("/register")}
              style={styles.primaryBtnLarge}
            >
              Start Free
            </button>

            <button
              onClick={() => navigate("/login")}
              style={styles.secondaryBtn}
            >
              Sign In
            </button>
          </div>
        </div>

        <div style={styles.heroGlow} />
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>Everything you need in one place</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Asset Tracking</h3>
            <p>Monitor asset status and ownership in real time.</p>
          </div>

          <div style={styles.card}>
            <h3>Vendor Management</h3>
            <p>Maintain structured supplier and procurement data.</p>
          </div>

          <div style={styles.card}>
            <h3>Departments</h3>
            <p>Organize assets across departments with clarity.</p>
          </div>

          <div style={styles.card}>
            <h3>Categories</h3>
            <p>Classify assets for faster filtering and reporting.</p>
          </div>

          <div style={styles.card}>
            <h3>Assignments</h3>
            <p>Assign assets to users with accountability tracking.</p>
          </div>

          <div style={styles.card}>
            <h3>Reports</h3>
            <p>Generate operational insights instantly.</p>
          </div>
        </div>
      </section>

      {/* OVERVIEW STRIP */}
      <section id="overview" style={styles.overview}>
        <div style={styles.overviewBox}>
          <h2>Built for operational clarity</h2>
          <p>
            Replace spreadsheets and scattered records with a structured,
            centralized system designed for real-world asset control.
          </p>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" style={styles.section}>
        <h2 style={styles.sectionTitle}>Secure by design</h2>

        <div style={styles.securityGrid}>
          <div style={styles.securityCard}>Role-based access control</div>
          <div style={styles.securityCard}>Audit logging for all changes</div>
          <div style={styles.securityCard}>Protected API endpoints</div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2>Ready to organize your assets?</h2>
        <p>Get started in minutes and bring structure to your operations.</p>

        <button
          onClick={() => navigate("/register")}
          style={styles.ctaButton}
        >
          Create Account
        </button>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} Group 4 Moringa
      </footer>
    </div>
  );
}


const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    background: "#f4f8ff",
    color: "#0b1f3a",
  },

  /* NAV */
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "white",
    borderBottom: "1px solid #e6eefc",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  logo: {
    fontWeight: "bold",
    color: "#0d6efd",
  },

  navLinks: {
    display: "flex",
    gap: "18px",
    fontSize: "14px",
    color: "#4a5b76",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  textBtn: {
    background: "transparent",
    border: "none",
    color: "#0d6efd",
    cursor: "pointer",
  },

  primaryBtn: {
    background: "#0d6efd",
    border: "none",
    color: "white",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  primaryBtnLarge: {
    background: "#0d6efd",
    border: "none",
    color: "white",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  secondaryBtn: {
    background: "white",
    border: "1px solid #cfe0ff",
    color: "#0d6efd",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  /* HERO */
  hero: {
    padding: "90px 20px",
    textAlign: "center",
    position: "relative",
    background:
      "linear-gradient(135deg, #e8f1ff, #f7fbff)",
  },

  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  title: {
    fontSize: "40px",
    marginBottom: "15px",
    color: "#0b2a55",
  },

  subtitle: {
    fontSize: "16px",
    color: "#4a5b76",
    marginBottom: "25px",
    lineHeight: "1.5",
  },

  ctaRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  heroGlow: {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle, rgba(13,110,253,0.15), transparent 60%)",
    filter: "blur(30px)",
  },

  /* SECTIONS */
  section: {
    padding: "70px 20px",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  sectionTitle: {
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "26px",
  },

  /* GRID */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },

  card: {
    background: "white",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #e6eefc",
    boxShadow: "0 6px 18px rgba(13,110,253,0.06)",
  },

  /* OVERVIEW */
  overview: {
    background: "#0d6efd",
    color: "white",
    padding: "60px 20px",
    textAlign: "center",
  },

  overviewBox: {
    maxWidth: "700px",
    margin: "0 auto",
  },

  /* SECURITY */
  securityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  securityCard: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #e6eefc",
    textAlign: "center",
  },

  /* CTA */
  cta: {
    textAlign: "center",
    padding: "80px 20px",
    background: "#e8f1ff",
  },

  ctaButton: {
    marginTop: "15px",
    background: "#0d6efd",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  /* FOOTER */
  footer: {
    textAlign: "center",
    padding: "20px",
    fontSize: "12px",
    color: "#6b7a90",
  },
};