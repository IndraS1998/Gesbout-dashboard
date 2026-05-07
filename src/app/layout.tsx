import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "react-hot-toast";
import {TokenProvider} from "@/context/TokenContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"], // ✅ REQUIRED
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ristourne Dashboard",
  description: "Gestion des ristournes",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <TokenProvider>
          {children}
          <Toaster position="bottom-right" toastOptions={{duration: 7000,}}/>
        </TokenProvider>
      </body>
    </html>
  );
}
