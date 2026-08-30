import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formation au Prompting Médical",
  description: "Entraînement au prompting IA pour professionnels de santé",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="!text-white !opacity-100">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900&display=swap" />
        <style>{`
        :root {
          --font-roboto: 'Roboto', sans-serif;
        }
      `}</style>
      </head>
      <body className="antialiased !border-black">
        {children}
      </body>
    </html>
  );
}
