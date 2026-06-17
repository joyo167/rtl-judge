import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "RTL Judge",
  description: "A competitive programming judge for RTL designs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background min-h-screen">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
