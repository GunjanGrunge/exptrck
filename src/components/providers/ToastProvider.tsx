'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#04132a',
          color: '#fff',
          border: '1px solid #759ab7',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #10B981',
          },
        },
        error: {
          iconTheme: {
            primary: '#ce6e55',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #ce6e55',
          },
        },
        loading: {
          iconTheme: {
            primary: '#759ab7',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}
