import React from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Plus, GitBranch, Clock, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';

const projects = [
  {
    id: 1,
    name: 'Web Application',
    description: 'Main customer-facing web application',
    repository: 'company/web-app',
    status: 'active',
    progress: 75,
    issues: 12,
    prs: 3,
    team: 5,
    lastActivity: '2 hours ago'
  },
  {
    id: 2,
    name: 'API Service',
    description: 'Backend API and microservices',
    repository: 'company/api-service',
    status: 'active',
    progress: 60,
    issues: 8,
    prs: 2,
    team: 3,
    lastActivity: '4 hours ago'
  },
  {
    id: 3,
    name: 'Mobile App',
    description: 'React Native mobile application',
    repository: 'company/mobile-app',
    status: 'planning',
    progress: 25,
    issues: 15,
    prs: 0,
    team: 2,
    lastActivity: '1 day ago'
  }
];

const Projects: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage and track your development projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.repository}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                project.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {project.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{project.description}</p>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{project.issues}</p>
                <p className="text-xs text-gray-500">Issues</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{project.prs}</p>
                <p className="text-xs text-gray-500">PRs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{project.team}</p>
                <p className="text-xs text-gray-500">Team</p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Clock className="h-4 w-4 mr-1" />
              Last activity {project.lastActivity}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <GitBranch className="h-4 w-4 mr-1" />
                Branches
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Users className="h-4 w-4 mr-1" />
                Team
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;