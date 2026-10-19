import type { Metadata } from "next";
import "./globals.css";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { StoreProvider } from "@/components/StoreProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-jost", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Maison Atelier — Contemporary Fashion", template: "%s | Maison Atelier" },
  description: "Contemporary clothing designed for people who refuse ordinary. Luxury fashion, editorial drops, and seamless shopping.",
  openGraph: { title: "Maison Atelier", description: "Contemporary clothing designed for people who refuse ordinary.", type: "website" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();" }} />
        <StoreProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
