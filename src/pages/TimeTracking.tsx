import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Pause, Square, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const TimeTracking: React.FC = () => {
  const [isTracking, setIsTracking] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState('00:00:00');

  const timeEntries = [
    {
      id: 1,
      issue: '#123 - Fix login validation',
      repository: 'web-app',
      duration: '2h 15m',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      issue: '#124 - Add user dashboard',
      repository: 'web-app',
      duration: '1h 45m',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 3,
      issue: '#125 - API optimization',
      repository: 'api-service',
      duration: '3h 30m',
      date: '2024-01-14',
      status: 'completed'
    }
  ];

  const weeklyStats = [
    { day: 'Mon', hours: 6.5 },
    { day: 'Tue', hours: 8.0 },
    { day: 'Wed', hours: 7.5 },
    { day: 'Thu', hours: 6.0 },
    { day: 'Fri', hours: 7.0 },
    { day: 'Sat', hours: 2.0 },
    { day: 'Sun', hours: 0.5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Track time spent on issues and generate reports</p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Active Timer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Timer</h3>
              <p className="text-gray-600">Issue #126 - Implement user notifications</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{currentTime}</p>
            <p className="text-sm text-gray-500">web-app repository</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mt-6">
          <Button
            onClick={() => setIsTracking(!isTracking)}
            variant={isTracking ? "secondary" : "primary"}
          >
            {isTracking ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button variant="outline">
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            <span className="text-sm text-gray-500">37.5 hours total</span>
          </div>
          
          <div className="space-y-3">
            {weeklyStats.map((stat, index) => (
              <div key={stat.day} className="flex items-center">
                <span className="w-8 text-sm text-gray-600">{stat.day}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.hours / 8) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="bg-blue-600 h-2 rounded-full"
                    ></motion.div>
                  </div>
                </div>
                <span className="w-12 text-sm text-gray-900 text-right">{stat.hours}h</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">37.5h</p>
              <p className="text-sm text-blue-700">This Week</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">142h</p>
              <p className="text-sm text-green-700">This Month</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">24</p>
              <p className="text-sm text-purple-700">Issues Worked</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">5.9h</p>
              <p className="text-sm text-orange-700">Avg/Day</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Time Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {timeEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{entry.issue}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{entry.repository}</span>
                    <span className="mx-2">•</span>
                    <span>{entry.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{entry.duration}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {entry.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TimeTracking;