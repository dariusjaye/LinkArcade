import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import React from "react";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { RewardProvider } from "@/lib/contexts/RewardContext";
import { SiteSettingsProvider } from "@/lib/contexts/SiteSettingsContext";
import { DataProvider } from "@/lib/contexts/DataContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinkArcade - Gamble with Your Cashback Rewards",
  description: "The ultimate platform to gamble with cashback rewards from our online Shopify shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            <RewardProvider>
              <SiteSettingsProvider>
                {children}
              </SiteSettingsProvider>
            </RewardProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
