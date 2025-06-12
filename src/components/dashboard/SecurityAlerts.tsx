import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

const alerts = [
  {
    id: 1,
    title: 'High severity vulnerability in express',
    severity: 'high',
    repository: 'web-app',
    time: '2 hours ago',
    status: 'open'
  },
  {
    id: 2,
    title: 'Medium severity vulnerability in lodash',
    severity: 'medium',
    repository: 'api-service',
    time: '4 hours ago',
    status: 'open'
  },
  {
    id: 3,
    title: 'Low severity vulnerability in axios',
    severity: 'low',
    repository: 'web-app',
    time: '1 day ago',
    status: 'resolved'
  }
];

const SecurityAlerts: React.FC = () => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{alert.repository}</span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{alert.title}</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {alert.time}
                </div>
              </div>
              <div className="ml-4">
                {alert.status === 'resolved' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {alerts.length === 0 && (
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No security alerts</p>
          <p className="text-sm text-gray-400">Your repositories are secure</p>
        </div>
      )}
    </div>
  );
};

export default SecurityAlerts;