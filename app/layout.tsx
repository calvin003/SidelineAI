import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Sideline — Scout smarter. Perform better.",
  description:
    "AI-powered scouting reports for athletes. Upload your tape, get evaluated, get recruited.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink min-h-screen">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
