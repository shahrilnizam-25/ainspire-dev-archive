import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AiNspire | Discover your AI persona", description: "A two-minute AI workforce assessment with six structured questions and targeted adaptive reflection.", icons: {icon: "/favicon.svg"} };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body className="antialiased">{children}</body></html>; }
