import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ToastProvider } from '@/components/providers/ToastProvider'

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
        <body className={`${inter.className} min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-accent-100/20 pointer-events-none"></div>
          <div className="relative z-10">
            {children}
          </div>
          <ToastProvider />
        </body>
      </html>
    </ClerkProvider>
  )
}
