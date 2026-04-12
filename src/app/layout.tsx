import type { Metadata } from "next";
import { Geist, Geist_Mono, Epilogue, Prompt } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display typeface: Epilogue — geometric grotesque with editorial character.
// Used for large headings where Latin text appears (member names, site H1s).
const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap",
  weight: "variable",
});

// Thai typeface: Prompt — geometric, premium Thai sans-serif.
// Covers Thai characters that Geist doesn't include.
// Used as the body and heading fallback for Thai text throughout the site.
const prompt = Prompt({
  weight: ["400", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSKU — Computer Science Student Organization",
  description:
    "Computer Science Student Organization at Kasetsart University. Building community, sharing knowledge, and creating opportunities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${epilogue.variable} ${prompt.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-white focus-visible:text-blue-700 focus-visible:rounded-lg focus-visible:shadow-lg focus-visible:text-sm focus-visible:font-medium focus-visible:border focus-visible:border-blue-200"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <SessionProvider>
          <ThemeProvider>
            <Navbar session={session} />
            <main id="main-content" className="flex-1 pt-16">{children}</main>
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
