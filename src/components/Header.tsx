"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/lib/contexts/SiteSettingsContext';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    displayName: 'Demo User',
    email: 'user@example.com',
    photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=random'
  });
  const [balance, setBalance] = useState('$100.00');
  const { settings } = useSiteSettings();
  
  // Check if user is logged in from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUser));
    }
  }, []);
  
  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('mockUser');
    setIsLoggedIn(false);
  };

  return (
    <header className={`bg-gray-900 text-white`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName} 
                className="h-8 mr-2"
              />
            ) : (
              <h1 className={`text-2xl font-bold text-${settings.primaryColor}-500`}>
                {settings.siteName}
              </h1>
            )}
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/games" className={`hover:text-${settings.primaryColor}-400 transition`}>
              Games
            </Link>
            <Link href="/rewards" className={`hover:text-${settings.primaryColor}-400 transition`}>
              Rewards
            </Link>
            <Link href="/leaderboard" className={`hover:text-${settings.primaryColor}-400 transition`}>
              Leaderboard
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile" className={`flex items-center space-x-2 hover:text-${settings.primaryColor}-400 transition`}>
                <div className={`w-8 h-8 rounded-full bg-${settings.primaryColor}-600 flex items-center justify-center overflow-hidden`}>
                  {userData.photoURL ? (
                    <img src={userData.photoURL} alt={userData.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userData.displayName?.charAt(0) || userData.email?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className="hidden md:inline">
                  {userData.displayName || userData.email?.split('@')[0] || 'User'}
                </span>
                <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                  {balance}
                </span>
              </Link>
              <button 
                onClick={handleSignOut}
                className={`bg-${settings.primaryColor}-600 hover:bg-${settings.primaryColor}-700 text-white px-4 py-2 rounded-md text-sm font-medium transition`}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                href="/login" 
                className={`bg-${settings.primaryColor}-600 hover:bg-${settings.primaryColor}-700 text-white px-4 py-2 rounded-md text-sm font-medium transition`}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className={`bg-transparent border border-${settings.primaryColor}-600 text-${settings.primaryColor}-600 hover:bg-${settings.primaryColor}-600 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition`}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 