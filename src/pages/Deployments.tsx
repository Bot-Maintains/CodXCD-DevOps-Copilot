import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle, XCircle, Clock, GitBranch, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Deployments: React.FC = () => {
  const deployments = [
    {
      id: 1,
      environment: 'Production',
      repository: 'web-app',
      branch: 'main',
      commit: 'a1b2c3d',
      status: 'success',
      deployedAt: '2024-01-15T10:30:00Z',
      deployedBy: 'john-doe',
      duration: '2m 15s'
    },
    {
      id: 2,
      environment: 'Staging',
      repository: 'api-service',
      branch: 'develop',
      commit: 'e4f5g6h',
      status: 'in_progress',
      deployedAt: '2024-01-15T11:45:00Z',
      deployedBy: 'jane-smith',
      duration: '1m 30s'
    },
    {
      id: 3,
      environment: 'Production',
      repository: 'api-service',
      branch: 'main',
      commit: 'i7j8k9l',
      status: 'failed',
      deployedAt: '2024-01-15T09:15:00Z',
      deployedBy: 'bob-wilson',
      duration: '45s'
    }
  ];

  const environments = [
    {
      name: 'Production',
      url: 'https://app.example.com',
      status: 'healthy',
      lastDeployment: '2 hours ago',
      version: 'v1.2.3'
    },
    {
      name: 'Staging',
      url: 'https://staging.example.com',
      status: 'deploying',
      lastDeployment: 'In progress',
      version: 'v1.2.4-rc.1'
    },
    {
      name: 'Development',
      url: 'https://dev.example.com',
      status: 'healthy',
      lastDeployment: '1 day ago',
      version: 'v1.3.0-dev'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'deploying':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployments</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your application deployments</p>
        </div>
        <Button>
          <Rocket className="h-4 w-4 mr-2" />
          New Deployment
        </Button>
      </div>

      {/* Environment Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {environments.map((env, index) => (
          <motion.div
            key={env.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(env.status)}`}>
                {env.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">URL</p>
                <a href={env.url} className="text-blue-600 hover:text-blue-700 text-sm truncate block">
                  {env.url}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium text-gray-900">{env.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Deployment</p>
                <p className="text-sm text-gray-900">{env.lastDeployment}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Play className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Recent Deployments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Deployments</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {deployments.map((deployment, index) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(deployment.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{deployment.repository}</h4>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-medium text-blue-600">{deployment.environment}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <GitBranch className="h-3 w-3 mr-1" />
                      <span>{deployment.branch}</span>
                      <span className="mx-2">•</span>
                      <span>{deployment.commit}</span>
                      <span className="mx-2">•</span>
                      <span>by {deployment.deployedBy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-900">{deployment.duration}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(deployment.deployedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Deployment Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Deployment Pipeline</h3>
        
        <div className="flex items-center space-x-4 overflow-x-auto">
          {[
            { name: 'Build', status: 'completed' },
            { name: 'Test', status: 'completed' },
            { name: 'Security Scan', status: 'completed' },
            { name: 'Deploy to Staging', status: 'in_progress' },
            { name: 'Integration Tests', status: 'pending' },
            { name: 'Deploy to Production', status: 'pending' }
          ].map((step, index) => (
            <div key={step.name} className="flex items-center">
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.status === 'completed' ? 'bg-green-500 border-green-500' :
                  step.status === 'in_progress' ? 'bg-yellow-500 border-yellow-500' :
                  'bg-gray-200 border-gray-300'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : step.status === 'in_progress' ? (
                    <Clock className="h-5 w-5 text-white" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">{step.name}</p>
              </div>
              {index < 5 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Deployments;