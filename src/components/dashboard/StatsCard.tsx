import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'blue' | 'red' | 'green' | 'purple';
}

const colorStyles = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200'
};

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color 
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            <TrendIcon className={cn(
              'h-4 w-4 mr-1',
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )} />
            <span className={cn(
              'text-sm font-medium',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className={cn(
          'w-12 h-12 rounded-lg border-2 flex items-center justify-center',
          colorStyles[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;