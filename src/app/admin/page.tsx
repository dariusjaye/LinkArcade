"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { SiteSettingsProvider } from '@/lib/contexts/SiteSettingsContext';
import AdminInitDatabase from '@/components/AdminInitDatabase';
import InitializeAllCollections from '@/components/InitializeAllCollections';
import { useAuth } from '@/lib/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import firebase from '@/lib/firebase/firebase';

// Dynamic import with SSR disabled
import dynamic from 'next/dynamic';
const GamesManagementStandalone = dynamic(
  () => import('./components/GamesManagementStandalone'),
  { ssr: false }
);

const SiteSettingsPanel = dynamic(
  () => import('./components/SiteSettingsPanel'),
  { ssr: false }
);

// Tab interfaces
interface UserRole {
  admin: boolean;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [siteSettings, setSiteSettings] = useState({});
  const [gameSettings, setGameSettings] = useState([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Admin authentication check
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!authLoading) {
        if (!user) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }
        
        // Check if user has admin role
        try {
          if (firebase.safeDb) {
            const roleDoc = await getDoc(doc(firebase.db, 'userRoles', user.uid));
            if (roleDoc.exists()) {
              const roleData = roleDoc.data() as UserRole;
              setUserRole(roleData);
              
              if (!roleData.admin) {
                // User is logged in but not an admin
                router.push('/');
              }
            } else {
              // No role document, assume not admin
              router.push('/');
            }
          } else {
            // Firebase DB not available
            router.push('/');
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
          router.push('/');
        }
        
        setIsLoading(false);
      }
    };
    
    checkAdminRole();
  }, [user, authLoading, router]);
  
  useEffect(() => {
    // Load saved settings from localStorage for demo
    const savedSettings = localStorage.getItem('adminSiteSettings');
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    }
    
    const savedGames = localStorage.getItem('adminGameSettings');
    if (savedGames) {
      setGameSettings(JSON.parse(savedGames));
    }
  }, []);
  
  const saveSettings = (type: string, data: any) => {
    if (type === 'site') {
      localStorage.setItem('adminSiteSettings', JSON.stringify(data));
      setSiteSettings(data);
    } else if (type === 'games') {
      localStorage.setItem('adminGameSettings', JSON.stringify(data));
      setGameSettings(data);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !userRole?.admin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
            <p className="mb-8">You need to be logged in as an admin to access this page.</p>
            <Link href="/">
              <Button variant="default">Return to Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage games, users, rewards settings, and site appearance for the LinkArcade platform
          </p>
        </div>
        
        <div className="mb-6">
          <nav className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'games' ? "default" : "outline"}
              onClick={() => setActiveTab('games')}
            >
              Games Management
            </Button>
            <Button
              variant={activeTab === 'users' ? "default" : "outline"}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </Button>
            <Button
              variant={activeTab === 'rewards' ? "default" : "outline"}
              onClick={() => setActiveTab('rewards')}
            >
              Rewards Settings
            </Button>
            <Button
              variant={activeTab === 'site' ? "default" : "outline"}
              onClick={() => setActiveTab('site')}
            >
              Site Settings
            </Button>
            <Button
              variant={activeTab === 'database' ? "default" : "outline"}
              onClick={() => setActiveTab('database')}
            >
              Database
            </Button>
          </nav>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          {activeTab === 'games' && (
            <GamesManagementStandalone />
          )}
          
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <p className="text-gray-400 mb-6">
                View and manage user accounts, balances, and permissions
              </p>
              
              <div className="bg-gray-900 rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">User Search</h3>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Search by username or email"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    />
                    <Button variant="default">Search</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Users</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        <tr>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">Admin</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">admin@example.com</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">$1,000.00</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="secondary" size="sm">Edit</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'rewards' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Rewards Settings</h2>
              <p className="text-gray-400 mb-6">
                Configure bonuses, cashback rates, and other reward parameters
              </p>
              
              <div className="bg-gray-900 rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Bonus Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sign-up Bonus Amount ($)
                      </label>
                      <input
                        type="number"
                        className="w-full sm:w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        defaultValue="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Daily Login Bonus ($)
                      </label>
                      <input
                        type="number"
                        className="w-full sm:w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        defaultValue="5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Deposit Bonus (%)
                      </label>
                      <input
                        type="number"
                        className="w-full sm:w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        defaultValue="100"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Cashback Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Basic Cashback Rate (%)
                      </label>
                      <input
                        type="number"
                        className="w-full sm:w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        defaultValue="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        VIP Cashback Rate (%)
                      </label>
                      <input
                        type="number"
                        className="w-full sm:w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        defaultValue="1.5"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="default">
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'site' && (
            <SiteSettingsProvider>
              <SiteSettingsPanel />
            </SiteSettingsProvider>
          )}
          
          {activeTab === 'database' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Database Management</h2>
              <p className="text-gray-400 mb-6">
                Initialize and manage the Firebase Firestore database
              </p>
              
              <div className="space-y-8">
                <AdminInitDatabase />
                <InitializeAllCollections />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 