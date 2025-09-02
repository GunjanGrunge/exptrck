import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-950 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your Expense Tracker account
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary-400 hover:bg-primary-500 text-white',
                card: 'shadow-none',
                headerTitle: 'text-dark-950',
                headerSubtitle: 'text-gray-600',
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
