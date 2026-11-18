import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar";
import {AuthProvider} from "@/app/components/authentication";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

// Outfit for headings and the wordmark, DM Sans for body text
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} · ${BRAND_TAGLINE}`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: "Rent a car at a pickup point near you. Book, pay and check the car in and out from your phone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning
        className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}
      >
         <AuthProvider>
            <Navbar />
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
