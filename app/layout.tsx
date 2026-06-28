import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AppProvider } from "@/components/AppContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
});

const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Kushvi Closet | Wear What You Pin",
  description: "Upload any outfit inspiration image and find matching premium clothes. Virtual AI Try-On and visual search tailored for you.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmsans.variable} font-body antialiased min-h-screen flex flex-col`}>
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
