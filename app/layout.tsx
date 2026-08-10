import type { Metadata } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Mono, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import "./public.css";

const display = Instrument_Serif({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const body = Manrope({ variable: "--font-body", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const ogImage = `${protocol}://${host}/og.png`;
  return {
    title: { default: "Clark Lo — Photography", template: "%s — Clark Lo" },
    description: "School life, performances, trips, cosplay gatherings, and the quiet moments between them—photographed by Taiwan-based student photographer Clark Lo.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "Clark Lo — Photography", description: "I keep the moments that usually pass.", type: "website", images:[{url:ogImage,width:1200,height:630,alt:"Clark Lo photography portfolio"}] },
    twitter: { card: "summary_large_image", title: "Clark Lo — Photography", description: "I keep the moments that usually pass.", images:[ogImage] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body></html>;
}
