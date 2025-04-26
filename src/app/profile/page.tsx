"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import UserStats from '@/components/UserStats';
import LeaderboardTable from '@/components/LeaderboardTable';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { useData } from '@/lib/contexts/DataContext';
import { updateDocument } from '@/lib/firebase/firebaseUtils';

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const { userStats, userGamePlays, loadingUserStats, loadingUserGamePlays } = useData();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Handle profile update
  const handleSaveChanges = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      await updateDocument('users', user.uid, {
        displayName: username,
        photoURL: photoURL,
      });
      
      // Also update any user entry in the leaderboard
      if (userProfile && userProfile.points && userProfile.points > 0) {
        // We'd need the leaderboard document ID which contains this user
        // This would require a separate query in a real application
      }
      
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSaving(false);
    }
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
                  <Image 
                    src={photoURL} 
                    alt={username} 
                    width={96} 
                    height={96} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-3xl">{username.charAt(0)}</span>
                )}
              </div>
              <h2 className="text-xl font-bold">{username}</h2>
              <p className="text-gray-400">{email}</p>
            </div>
            
            <div className="border-t border-gray-700 pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Points</span>
                <span className="text-xl font-bold">{userProfile?.points?.toLocaleString() || 0}</span>
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
            {/* User Stats */}
            <UserStats />
            
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
                  <Button 
                    variant="default" 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              
              {loadingUserGamePlays ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              ) : userGamePlays.length > 0 ? (
                <div className="space-y-3">
                  {userGamePlays.slice(0, 5).map((gamePlay) => (
                    <div key={gamePlay.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium">{gamePlay.outcome === 'win' ? 'Won' : 'Lost'} game</p>
                        <p className="text-sm text-gray-400">
                          {new Date(gamePlay.createdAt?.toMillis()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={gamePlay.outcome === 'win' ? 'text-green-500' : 'text-red-500'}>
                        {gamePlay.outcome === 'win' 
                          ? `+${gamePlay.winAmount.toLocaleString()}` 
                          : `-${gamePlay.bet.toLocaleString()}`} pts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 