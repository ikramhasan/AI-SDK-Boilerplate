import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/app-providers";
import { getToken } from "@/lib/auth-server";
import { getSiteMetadata, getSiteName } from "@/lib/site-data";
import type { Metadata } from "next";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteMetadata = getSiteMetadata()
const siteName = getSiteName()

export const metadata: Metadata = {
  title: siteMetadata.metaTitle,
  description: siteMetadata.metaDescription,
  applicationName: siteName,
  openGraph: {
    title: siteMetadata.metaTitle,
    description: siteMetadata.metaDescription,
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.metaTitle,
    description: siteMetadata.metaDescription,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialToken = await getToken();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <AppProviders initialToken={initialToken}>{children}</AppProviders>
      </body>
    </html>
  )
}
