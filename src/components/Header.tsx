"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/lib/contexts/SiteSettingsContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, userProfile, loading: authLoading, error: authError, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
          {authLoading ? (
            <div className="w-6 h-6 border-2 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile" className={`flex items-center space-x-2 hover:text-${settings.primaryColor}-400 transition`}>
                <div className={`w-8 h-8 rounded-full bg-${settings.primaryColor}-600 flex items-center justify-center overflow-hidden`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className="hidden md:inline">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </span>
                {userProfile && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                    {userProfile.points} pts
                  </span>
                )}
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