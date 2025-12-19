// src/app/layout.tsx
import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volunteer App",
  description: "Next.js app with Auth0 authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Auth0Provider>
          <Navbar /> 
          <main className="flex-grow">
            {children}
          </main>
        </Auth0Provider>
      </body>
    </html>
  );
}