import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Portfolio AI turns your resume into a portfolio in 60 seconds",
  description:
    "Upload your resume, drop in some inspiration, and Portfolio AI generates a polished, fully editable portfolio site in under a minute.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Fredoka:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Newsreader:ital,wght@0,400;0,600;1,400&family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@500;600;700&family=Quicksand:wght@400;500;600;700&family=Archivo+Black&family=Caveat:wght@500;600;700&family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
