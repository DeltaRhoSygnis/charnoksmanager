'use client'

import { AuthProvider } from '../client/src/hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '../client/src/components/ui/toaster'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../client/src/components/auth/ProtectedRoute'
import { Home } from '../client/src/pages/Home'
import { Sales } from '../client/src/pages/Sales'
import { Expenses } from '../client/src/pages/Expenses'
import { Settings } from '../client/src/pages/Settings'
import { NotFound } from '../client/src/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen charnoks-gradient">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sales" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}