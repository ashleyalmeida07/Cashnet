import type { Metadata } from 'next'
import { Chakra_Petch, IBM_Plex_Mono, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const chakraPetch = Chakra_Petch({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-heading'
});

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: '--font-mono'
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'Rust-eze Simulation Lab',
  description: 'Institutional DeFi Risk Simulation Platform',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${chakraPetch.variable} ${ibmPlexMono.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
