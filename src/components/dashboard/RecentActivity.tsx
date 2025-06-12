import React from 'react';
import { motion } from 'framer-motion';
import { 
  GitCommit, 
  GitPullRequest, 
  Bug, 
  Rocket, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'commit',
    title: 'Fix authentication bug in user service',
    repository: 'web-app',
    user: 'john-doe',
    time: '5 minutes ago',
    icon: GitCommit,
    color: 'text-blue-600'
  },
  {
    id: 2,
    type: 'pr',
    title: 'Add new dashboard components',
    repository: 'web-app',
    user: 'jane-smith',
    time: '15 minutes ago',
    icon: GitPullRequest,
    color: 'text-green-600'
  },
  {
    id: 3,
    type: 'deployment',
    title: 'Deployed to production',
    repository: 'api-service',
    user: 'codxcd-bot',
    time: '1 hour ago',
    icon: Rocket,
    color: 'text-purple-600'
  },
  {
    id: 4,
    type: 'issue',
    title: 'Login form validation error',
    repository: 'web-app',
    user: 'alice-jones',
    time: '2 hours ago',
    icon: Bug,
    color: 'text-red-600'
  },
  {
    id: 5,
    type: 'time',
    title: 'Logged 2.5 hours on issue #123',
    repository: 'web-app',
    user: 'bob-wilson',
    time: '3 hours ago',
    icon: Clock,
    color: 'text-orange-600'
  }
];

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Activity
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span className="font-medium">{activity.user}</span>
                <span className="mx-1">•</span>
                <span>{activity.repository}</span>
                <span className="mx-1">•</span>
                <span>{activity.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;