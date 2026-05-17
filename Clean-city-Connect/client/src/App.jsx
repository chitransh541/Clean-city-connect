import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import FloatingLeaves from './components/animations/FloatingLeaves';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Feedback from './pages/Feedback';
import Dashboard from './pages/Dashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import MapView from './pages/MapView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FloatingLeaves count={6} />
        <Navbar />
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'toast-custom',
            duration: 4000,
            style: {
              fontFamily: "'Outfit', sans-serif",
              borderRadius: '12px',
              padding: '12px 20px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
          }}
        />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/complaint-map" element={<MapView />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/officer-dashboard"
              element={
                <ProtectedRoute role="officer">
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
