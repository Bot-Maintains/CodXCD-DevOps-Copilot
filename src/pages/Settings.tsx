import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Github, Key, Bell, Shield, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your CodXCD configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* GitHub Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Github className="h-5 w-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">GitHub Integration</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">Connected to GitHub</p>
                  <p className="text-sm text-green-600">Authorized for 8 repositories</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value="https://api.codxcd.com/webhooks"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </motion.div>

          {/* API Keys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Key className="h-5 w-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Personal Access Token</p>
                  <p className="text-sm text-gray-500">Last used: 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
              <Button variant="primary">
                Generate New API Key
              </Button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Security alerts', enabled: true },
                { label: 'Deployment notifications', enabled: true },
                { label: 'Pull request reviews', enabled: false },
                { label: 'Issue assignments', enabled: true },
                { label: 'Weekly reports', enabled: true }
              ].map((notification, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{notification.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={notification.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Plan Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <SettingsIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Pro Plan</h3>
              <p className="text-gray-600">$29/month</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Repositories</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team members</span>
                <span className="font-medium">8/25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CI/CD runs</span>
                <span className="font-medium">Unlimited</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Subscription
            </Button>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Team</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'John Doe', role: 'Admin', avatar: 'JD' },
                { name: 'Jane Smith', role: 'Developer', avatar: 'JS' },
                { name: 'Bob Wilson', role: 'Developer', avatar: 'BW' }
              ].map((member, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Invite Team Member
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;