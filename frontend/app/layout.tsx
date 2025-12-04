import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import API_BASE_URL from "@/app/config/api"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "JMIT Online Aptitude Test System",
  description: "A full-featured platform for online aptitude testing for college students",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const apiOrigin = API_BASE_URL.replace(/\/$/, '').replace(/\/(api|v1|v2)$/, '')
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={apiOrigin} crossOrigin="" />
        <link rel="dns-prefetch" href={apiOrigin} />
      </head>
      <body className={`${poppins.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
