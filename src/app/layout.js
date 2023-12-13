import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import './scripts.js'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MEMES FIGHT Bettings',
  description: 'MEMES FIGHT is a betting platform. You can bet on your favorite memes and earn money.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
        </body>
    </html>
  )
}
