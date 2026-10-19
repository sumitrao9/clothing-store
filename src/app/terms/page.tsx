export const metadata = { title: "Terms & Conditions — Maison Atelier" };
export default function TermsPage() {
  return (
    <div className="container" style={{ paddingTop: 130, paddingBottom: 60 }}>
      <div className="narrow">
        <h1 style={{ fontSize: "2.4rem", marginBottom: "1.5rem" }}>Terms &amp; Conditions</h1>
        <p style={{ color: "#5a554d", marginBottom: "1rem" }}>By placing an order you agree to provide accurate information and accept our pricing, shipping, and return policies. Items may be returned within 30 days of delivery in original condition.</p>
        <p style={{ color: "#5a554d", marginBottom: "1rem" }}>Product imagery is representative; minor variations in color and finish may occur with natural materials.</p>
        <p style={{ color: "#5a554d" }}>Maison Atelier reserves the right to cancel any order that cannot be fulfilled. These terms are governed by the laws of the jurisdiction in which the brand operates.</p>
      </div>
    </div>
  );
}
