import type { Metadata } from "next";
import { Poppins, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "../provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapCart | 10 minute Grocery Delivery Service",
  description: "Fast and convenient grocery delivery at your doorstep",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans w-full min-h-screen bg-gradient-to-b from-green-100 to-white`}
      >
        <Provider>
          <StoreProvider>
            <InitUser/>
              {children}
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
