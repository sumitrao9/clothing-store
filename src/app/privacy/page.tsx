export const metadata = { title: "Privacy Policy — Maison Atelier" };
export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: 130, paddingBottom: 60 }}>
      <div className="narrow">
        <h1 style={{ fontSize: "2.4rem", marginBottom: "1.5rem" }}>Privacy Policy</h1>
        <p style={{ color: "#5a554d", marginBottom: "1rem" }}>We collect only the information needed to fulfill your orders and improve your experience: name, email, shipping address, and payment confirmation (never card numbers, which are handled securely by our payment providers).</p>
        <p style={{ color: "#5a554d", marginBottom: "1rem" }}>Your data is never sold. You may request export or deletion at any time by contacting hello@maison-atelier.com.</p>
        <p style={{ color: "#5a554d" }}>This policy may be updated periodically. Continued use constitutes acceptance of the current version.</p>
      </div>
    </div>
  );
}
