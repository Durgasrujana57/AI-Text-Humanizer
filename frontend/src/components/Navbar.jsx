import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  SparklesIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'AI Detector', href: '/detector', icon: MagnifyingGlassIcon },
    { name: 'Humanizer', href: '/humanizer', icon: SparklesIcon },
    { name: 'History', href: '/history', icon: ClockIcon },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <SparklesIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              AI Text Humanizer
            </span>
          </Link>

          <div className="flex space-x-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;