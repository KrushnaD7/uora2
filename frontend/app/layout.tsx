import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["500", "600", "700"],
});

const description =
  "UORA Publications is an international academic publisher advancing research through transparent peer review, DOI-registered open-access journals, and internationally recognised scholarly communication.";

export const metadata: Metadata = {
  title: {
    default: "UORA Publications — International Academic Publishing",
    template: "%s · UORA Publications",
  },
  description,
  keywords: [
    "Research",
    "Academic Journals",
    "Scientific Publishing",
    "Open Access",
    "Peer Review",
    "DOI",
    "UORA Publications",
  ],
  authors: [{ name: "Universal Oneness in Research Association (UORA)" }],
  openGraph: {
    type: "website",
    siteName: "UORA Publications",
    title: "UORA Publications — International Academic Publishing",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "UORA Publications — International Academic Publishing",
    description,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c2340",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body suppressHydrationWarning className="bg-canvas text-ink-900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
