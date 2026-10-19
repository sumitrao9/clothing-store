import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: 160, paddingBottom: 100, textAlign: "center", minHeight: "60vh" }}>
      <p className="eyebrow">404</p>
      <h1 style={{ fontSize: "clamp(2.5rem,8vw,5rem)", margin: "0.5rem 0" }}>Page Not Found</h1>
      <p style={{ color: "#8a8278", marginBottom: "2rem" }}>The piece you&apos;re looking for may have moved or sold out.</p>
      <Link href="/" className="btn btn-dark">Return Home</Link>
    </div>
  );
}
