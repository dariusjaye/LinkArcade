"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { SiteSettingsProvider } from '@/lib/contexts/SiteSettingsContext';

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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('games');

  // Set up a mock admin user
  const setupAdminUser = () => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Make sure the user has admin role
      if (!user.roles || !user.roles.includes('admin')) {
        user.roles = ['user', 'admin'];
        localStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      // Create admin user if no user exists
      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        username: 'Admin',
        photoURL: null,
        roles: ['user', 'admin'],
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      // Also initialize a balance for this user
      localStorage.setItem('balance', JSON.stringify({
        amount: 1000,
        currency: 'USD',
        user_id: 'admin-123'
      }));
    }
  };

  useEffect(() => {
    // Set up mock admin user for demo
    setupAdminUser();
    
    // Check if user is authenticated and has admin role
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.roles && user.roles.includes('admin')) {
        setIsAuthenticated(true);
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
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

  if (!isAuthenticated) {
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 