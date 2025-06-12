import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Star, 
  Download, 
  Search,
  Filter,
  ExternalLink,
  Shield,
  Zap,
  Code,
  BarChart3,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

interface Extension {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: string;
  price: 'free' | 'paid';
  priceAmount?: string;
  developer: string;
  icon: React.ComponentType<any>;
  features: string[];
  installed: boolean;
}

const extensions: Extension[] = [
  {
    id: '1',
    name: 'Security Scanner Pro',
    description: 'Advanced security vulnerability scanning with real-time alerts and automated fixes',
    category: 'Security',
    rating: 4.8,
    downloads: '12.5K',
    price: 'paid',
    priceAmount: '$29/month',
    developer: 'SecureCode Inc.',
    icon: Shield,
    features: ['Real-time scanning', 'Automated fixes', 'Compliance reports'],
    installed: true
  },
  {
    id: '2',
    name: 'Performance Monitor',
    description: 'Monitor application performance and get insights into bottlenecks',
    category: 'Analytics',
    rating: 4.6,
    downloads: '8.2K',
    price: 'free',
    developer: 'DevTools Co.',
    icon: BarChart3,
    features: ['Performance metrics', 'Real-time monitoring', 'Custom dashboards'],
    installed: false
  },
  {
    id: '3',
    name: 'Code Quality Checker',
    description: 'Automated code quality analysis with detailed reports and suggestions',
    category: 'Code Quality',
    rating: 4.7,
    downloads: '15.3K',
    price: 'free',
    developer: 'QualityFirst',
    icon: Code,
    features: ['Code analysis', 'Quality metrics', 'Best practices'],
    installed: false
  },
  {
    id: '4',
    name: 'Team Collaboration Hub',
    description: 'Enhanced team collaboration tools with advanced project management',
    category: 'Collaboration',
    rating: 4.9,
    downloads: '22.1K',
    price: 'paid',
    priceAmount: '$15/user/month',
    developer: 'TeamSync Ltd.',
    icon: Users,
    features: ['Team chat', 'Project boards', 'Time tracking'],
    installed: true
  },
  {
    id: '5',
    name: 'Deployment Accelerator',
    description: 'Streamline your deployment process with automated pipelines',
    category: 'Deployment',
    rating: 4.5,
    downloads: '9.7K',
    price: 'paid',
    priceAmount: '$19/month',
    developer: 'DeployFast',
    icon: Zap,
    features: ['Automated deployments', 'Pipeline management', 'Rollback support'],
    installed: false
  },
  {
    id: '6',
    name: 'Time Tracker Plus',
    description: 'Advanced time tracking with detailed analytics and reporting',
    category: 'Productivity',
    rating: 4.4,
    downloads: '6.8K',
    price: 'free',
    developer: 'TimeWise',
    icon: Clock,
    features: ['Time tracking', 'Analytics', 'Team reports'],
    installed: false
  }
];

const categories = ['All', 'Security', 'Analytics', 'Code Quality', 'Collaboration', 'Deployment', 'Productivity'];

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');

  const filteredExtensions = extensions.filter(extension => {
    const matchesSearch = extension.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         extension.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || extension.category === selectedCategory;
    const matchesPrice = priceFilter === 'all' || extension.price === priceFilter;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const installedCount = extensions.filter(ext => ext.installed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-1">Discover and install extensions to enhance your workflow</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Installed Extensions</p>
            <p className="text-2xl font-bold text-blue-600">{installedCount}</p>
          </div>
          <Button icon={ShoppingBag} variant="primary">
            Browse All
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search extensions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Featured Extensions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Featured Extension</h2>
        <p className="text-blue-100 mb-6">Boost your security with our most popular extension</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Security Scanner Pro</h3>
                <p className="text-blue-100">by SecureCode Inc.</p>
              </div>
            </div>
            <p className="text-blue-100 mb-4">
              Advanced security vulnerability scanning with real-time alerts and automated fixes
            </p>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>4.8</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>12.5K downloads</span>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Key Features:</h4>
            <ul className="space-y-2 text-blue-100">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Real-time vulnerability scanning</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Automated security fixes</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Compliance reporting</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Integration with CI/CD</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Extensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExtensions.map((extension, index) => {
          const IconComponent = extension.icon;
          
          return (
            <motion.div
              key={extension.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{extension.name}</h3>
                    <p className="text-sm text-gray-500">{extension.developer}</p>
                  </div>
                </div>
                {extension.installed && (
                  <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
                    Installed
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{extension.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900">{extension.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className={cn(
                    "font-medium",
                    extension.price === 'free' ? 'text-green-600' : 'text-blue-600'
                  )}>
                    {extension.price === 'free' ? 'Free' : extension.priceAmount}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{extension.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>{extension.downloads}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-gray-700">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {extension.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {extension.installed ? (
                  <Button variant="outline\" size="sm\" className="flex-1">
                    Configure
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" className="flex-1">
                    Install
                  </Button>
                )}
                <Button variant="outline" size="sm" icon={ExternalLink}>
                  Details
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredExtensions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No extensions found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </div>
  );
};

export default Marketplace;