export const metadata = { title: "About — Maison Atelier" };
export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: 130, paddingBottom: 60 }}>
      <div className="narrow" style={{ maxWidth: 720 }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>Our Story</p>
        <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.5rem)", textAlign: "center", marginBottom: "1.5rem" }}>Where Clothing Meets Character</h1>
        <p style={{ color: "#5a554d", marginBottom: "1rem" }}>Maison Atelier began with a simple belief: that what we wear is an extension of who we are. We design contemporary essentials — cut precisely, made responsibly, and finished to be worn for years.</p>
        <p style={{ color: "#5a554d", marginBottom: "1rem" }}>Every collection is an editorial study in restraint: clean lines, honest materials, and a palette drawn from stone, shadow, and light.</p>
        <p style={{ color: "#5a554d" }}>From our atelier to your wardrobe, we obsess over the details so you can simply wear your own statement.</p>
      </div>
    </div>
  );
}
