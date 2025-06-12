import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Security from './pages/Security';
import Deployments from './pages/Deployments';
import TimeTracking from './pages/TimeTracking';
import Settings from './pages/Settings';
import Marketplace from './pages/Marketplace';
import Subscription from './pages/Subscription';
import Checkout from './pages/Checkout';
import { Toaster } from './components/ui/Toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="security" element={<Security />} />
              <Route path="deployments" element={<Deployments />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;