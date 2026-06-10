import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Providers from './providers'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Booking',
  description: 'Schedule an appointment',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
