import { Geist, Geist_Mono } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/clerk-convex-provider";
import { CommandMenu } from "@/components/command-menu";
import { QueryProvider } from "@/lib/query-provider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <TooltipProvider>
          <ClerkProvider>
            <ConvexClientProvider>
              <QueryProvider>
                <ThemeProvider>
                  <CommandMenu />
                  {children}
                </ThemeProvider>
              </QueryProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
