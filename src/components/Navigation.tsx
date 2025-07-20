import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Settings, History, Bot } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/history', icon: History, label: 'History' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/banner.png"
              alt="Sense AIO Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-display font-bold neon-text">
              Sense AIO
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-primary/20 text-primary glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navigation };