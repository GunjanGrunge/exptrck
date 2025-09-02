import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Expense Tracker',
  description: 'Track your monthly expenses, EMIs, and budget effectively',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_demo_key'}
    >
      <html lang="en">
        <body className={`${inter.className} bg-gray-50`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
