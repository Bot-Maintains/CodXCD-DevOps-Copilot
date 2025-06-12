import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Security: React.FC = () => {
  const alerts = [
    {
      id: 1,
      title: 'High severity vulnerability in express',
      description: 'Prototype pollution vulnerability that can lead to remote code execution',
      severity: 'high',
      repository: 'web-app',
      file: 'package.json',
      introduced: '2024-01-15',
      status: 'open',
      cveId: 'CVE-2024-1234'
    },
    {
      id: 2,
      title: 'Medium severity vulnerability in lodash',
      description: 'Prototype pollution in lodash utility library',
      severity: 'medium',
      repository: 'api-service',
      file: 'package-lock.json',
      introduced: '2024-01-10',
      status: 'open',
      cveId: 'CVE-2024-5678'
    },
    {
      id: 3,
      title: 'Low severity vulnerability in axios',
      description: 'Regular expression denial of service vulnerability',
      severity: 'low',
      repository: 'web-app',
      file: 'package.json',
      introduced: '2024-01-08',
      status: 'resolved',
      cveId: 'CVE-2024-9012'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security</h1>
          <p className="text-gray-600 mt-1">Monitor and manage security vulnerabilities across your repositories</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Run Security Scan
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Critical', count: 0, color: 'bg-red-500', textColor: 'text-red-600' },
          { label: 'High', count: 1, color: 'bg-orange-500', textColor: 'text-orange-600' },
          { label: 'Medium', count: 1, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
          { label: 'Low', count: 1, color: 'bg-green-500', textColor: 'text-green-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.count}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Repositories</option>
            <option>web-app</option>
            <option>api-service</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Severities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{alert.repository}</span>
                  <span className="text-sm text-gray-400 ml-2">•</span>
                  <span className="text-sm text-gray-500 ml-2">{alert.cveId}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{alert.title}</h3>
                <p className="text-gray-600 mb-3">{alert.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">File:</span>
                    <p className="font-medium text-gray-900">{alert.file}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Introduced:</span>
                    <p className="font-medium text-gray-900">{alert.introduced}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="flex items-center mt-1">
                      {alert.status === 'resolved' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-medium">Resolved</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-yellow-600 font-medium">Open</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                {alert.status === 'open' && (
                  <>
                    <Button size="sm">Fix Now</Button>
                    <Button variant="outline" size="sm">Dismiss</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 p-6 rounded-xl border border-blue-200"
      >
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Security Recommendations</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Enable Dependabot alerts for automatic vulnerability monitoring</li>
              <li>• Set up automated security scanning in your CI/CD pipeline</li>
              <li>• Review and update dependencies monthly</li>
              <li>• Configure branch protection rules for sensitive repositories</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Security;