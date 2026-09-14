import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mental Health App",
  description: "KI-Begleiter, Stimmungs-Tracking und digitales Tagebuch für deine mentale Gesundheit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
