'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-400"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dark-950 mb-2">
              Expense Tracker
            </h1>
            <p className="text-gray-600">
              Manage your expenses, EMIs, and budget effectively
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary-400 hover:bg-primary-500 text-white',
                  card: 'shadow-none',
                }
              }}
              routing="hash"
            />
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
