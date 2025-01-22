import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Bell, User, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <Calendar className="h-8 w-8 text-blue-600 transition-transform group-hover:scale-110" />
                <div className="absolute -inset-1 rounded-full bg-blue-100 animate-pulse group-hover:animate-none opacity-0 group-hover:opacity-50 transition-opacity" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                EventHub
              </span>
            </div>
            
            <div className="hidden md:flex md:ml-10 md:space-x-8">
              {['Events', 'Categories', 'About'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-all duration-200 ${
                    item === 'Events'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Search and Secondary Nav */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search events..."
                className="w-48 pl-10 pr-4 py-1.5 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all group-hover:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </button>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all">
                    <User className="h-5 w-5" />
                    <span className="max-w-[150px] truncate">{user.email}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">My Events</a>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-0 z-40 w-full bg-white`}
      >
        <div className="pt-16 pb-3 space-y-1 px-4">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {['Events', 'Categories', 'About'].map((item) => (
            <a
              key={item}
              href="#"
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                item === 'Events'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="pt-4 pb-3 border-t border-gray-200 px-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 truncate max-w-[200px]">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  My Events
                </a>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4">
              <button
                onClick={onOpenAuth}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}