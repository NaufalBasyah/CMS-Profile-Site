import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Archivo variable font (weight and width axes), served from this app. SIL OFL, see app/fonts/OFL-LICENSE.txt.
const archivo = localFont({
  src: [{ path: "./fonts/archivo-latin-wdth-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PT. CMS Chem Indonesia | E.B.S. manufacturer from Indonesia",
    template: "%s | PT. CMS Chem Indonesia",
  },
  description:
    "Indonesia's first ethylene bis stearamide (E.B.S.) manufacturer. HI-LUB beads and powders from Sumatran palm-based stearic acid for resin producers across Asia.",
  icons: { icon: "/img/logo.png" },
  openGraph: {
    type: "website",
    siteName: "PT. CMS Chem Indonesia",
    images: [{ url: "/img/factory.jpg", width: 1287, height: 484, alt: "The CMS Chem plant in Medan" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1950",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} antialiased`}>
      <body className="min-h-dvh">
        <div className="root flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
