import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AgentProvider } from "@/context/AgentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuyBuddy AI",
  description: "Conversational In-App Checkout powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <CartProvider>
          <AgentProvider>
            {children}
          </AgentProvider>
        </CartProvider>
      </body>
    </html>
  );
}
