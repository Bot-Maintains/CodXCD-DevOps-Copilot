import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Shield, 
  Rocket, 
  Clock, 
  Settings,
  ShoppingBag,
  Bot
} from 'lucide-react';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Deployments', href: '/deployments', icon: Rocket },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Subscription', href: '/subscription', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-white w-64 shadow-xl border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CodXCD</h1>
            <p className="text-sm text-gray-500">DevOps Copilot</p>
          </div>
        </div>
      </div>
      
      <nav className="px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              {item.name}
              {isActive && (
                <motion.div
                  className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;