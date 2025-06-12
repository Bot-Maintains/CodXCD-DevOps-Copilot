import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Shield, 
  Rocket, 
  Activity
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import SecurityAlerts from '../components/dashboard/SecurityAlerts';
import { GitHubRepo } from '../utils/github';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<{
    activeIssues: number;
    securityAlerts: number;
    deployments: number;
    timeTracked: number;
  } | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const { isAuthenticated } = await response.json();
        setIsConnected(isAuthenticated);
        
        if (isAuthenticated) {
          // Fetch real GitHub data
          const [reposResponse, statsResponse] = await Promise.all([
            fetch('/api/github/repos'),
            fetch('/api/github/stats')
          ]);
          
          const reposData = await reposResponse.json();
          const statsData = await statsResponse.json();
          
          setRepos(reposData);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <h2 className="text-2xl font-bold mb-4">Connect your GitHub account to get started</h2>
        <p className="text-gray-600 mb-6">To see your real projects, stats, and security scans, please connect your GitHub account.</p>
        <a
          href="/auth/github"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Connect to GitHub
        </a>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Issues',
      value: stats?.activeIssues.toString() || '0',
      change: '+12%',
      trend: 'up' as const,
      icon: Activity,
      color: 'blue' as const
    },
    {
      title: 'Security Alerts',
      value: stats?.securityAlerts.toString() || '0',
      change: '-25%',
      trend: 'down' as const,
      icon: Shield,
      color: 'red' as const
    },
    {
      title: 'Deployments',
      value: stats?.deployments.toString() || '0',
      change: '+8%',
      trend: 'up' as const,
      icon: Rocket,
      color: 'green' as const
    },
    {
      title: 'Time Tracked',
      value: `${stats?.timeTracked || 0}h`,
      change: '+15%',
      trend: 'up' as const,
      icon: Clock,
      color: 'purple' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {repos.length 
              ? `Monitoring ${repos.length} repositories` 
              : 'No repositories found'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ActivityChart />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <SecurityAlerts />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <RecentActivity repos={repos} />
      </motion.div>
    </div>
  );
};

export default Dashboard;