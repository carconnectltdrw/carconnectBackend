import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ReduxProvider } from "../components/store/ReduxProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: "CarConnect Ltd ",
  description: "Carconnect Ltd - Revolutionizing Transportation and Mobility Solutions",
  generator: "CarConnect",
  icons: {
    icon: "/logo.png",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  )
}
