import React from "react";
import "./globals.css";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <Link href="/" className="flex items-center font-bold text-lg mr-6">
                <FileText className="h-5 w-5 mr-2" />
                RFP Analyzer
              </Link>
              <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  About
                </Link>
              </nav>
              <div className="ml-auto flex items-center space-x-4">
                <Link
                  href="/settings"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Settings
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t py-6">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © 2023 RFP Analysis Automation. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
