"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRewards } from '@/lib/hooks/useRewards';
import { formatCurrency } from '@/lib/utils';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { balance, formattedBalance, transactions } = useRewards();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Set user data when available
  useEffect(() => {
    if (user) {
      setUsername(user.displayName || user.email?.split('@')[0] || 'User');
      setEmail(user.email || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);
  
  // Calculate stats
  const totalWagered = transactions
    .filter(t => t.type === 'loss')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const totalWon = transactions
    .filter(t => t.type === 'win')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const gamesPlayed = transactions
    .filter(t => t.type === 'loss' || t.type === 'win')
    .length;
    
  const winRate = gamesPlayed > 0 
    ? (transactions.filter(t => t.type === 'win').length / gamesPlayed) * 100 
    : 0;
    
  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };
  
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-6 h-6 border-2 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-400 mb-8">
          Manage your account and view your stats
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-pink-600 flex items-center justify-center overflow-hidden mb-4">
                {photoURL ? (
                  <img src={photoURL} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{username.charAt(0)}</span>
                )}
              </div>
              <h2 className="text-xl font-bold">{username}</h2>
              <p className="text-gray-400">{email}</p>
            </div>
            
            <div className="border-t border-gray-700 pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Balance</span>
                <span className="text-xl font-bold">{formattedBalance}</span>
              </div>
              <Link href="/rewards" className="block w-full">
                <Button variant="default" className="w-full">
                  View Rewards
                </Button>
              </Link>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <Button variant="outline" onClick={handleLogout} className="w-full text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                Logout
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Total Wagered</p>
                <p className="text-xl font-bold">{formatCurrency(totalWagered)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Total Won</p>
                <p className="text-xl font-bold">{formatCurrency(totalWon)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Games Played</p>
                <p className="text-xl font-bold">{gamesPlayed}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Win Rate</p>
                <p className="text-xl font-bold">{winRate.toFixed(1)}%</p>
              </div>
            </div>
            
            {/* Account Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white shadow-sm focus:ring-2 focus:ring-inset focus:ring-pink-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white shadow-sm focus:ring-2 focus:ring-inset focus:ring-pink-500 sm:text-sm"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="photoURL" className="block text-sm font-medium mb-2">
                    Profile Picture URL
                  </label>
                  <input
                    id="photoURL"
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white shadow-sm focus:ring-2 focus:ring-inset focus:ring-pink-500 sm:text-sm"
                  />
                </div>
                
                <div className="pt-4">
                  <Button variant="default">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show me on leaderboard</h3>
                    <p className="text-sm text-gray-400">Allow your username and stats to appear on the leaderboard</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                    <input type="checkbox" className="peer sr-only" id="show-leaderboard" defaultChecked />
                    <span className="absolute inset-0 peer-checked:bg-pink-600 rounded-full transition"></span>
                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email notifications</h3>
                    <p className="text-sm text-gray-400">Receive email updates about new games and promotions</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                    <input type="checkbox" className="peer sr-only" id="email-notifications" defaultChecked />
                    <span className="absolute inset-0 peer-checked:bg-pink-600 rounded-full transition"></span>
                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Public profile</h3>
                    <p className="text-sm text-gray-400">Allow other users to view your profile</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                    <input type="checkbox" className="peer sr-only" id="public-profile" />
                    <span className="absolute inset-0 peer-checked:bg-pink-600 rounded-full transition"></span>
                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 