"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeaderboardTable from '@/components/LeaderboardTable';
import { useData } from '@/lib/contexts/DataContext';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week' | 'day'>('all');
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-400 mb-8">
          Top players ranked by points. See if you can reach the top!
        </p>
        
        {/* Time Filter */}
        <div className="flex space-x-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeFilter === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            onClick={() => setTimeFilter('all')}
          >
            All Time
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeFilter === 'month' ? 'bg-pink-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            onClick={() => setTimeFilter('month')}
          >
            This Month
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeFilter === 'week' ? 'bg-pink-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            onClick={() => setTimeFilter('week')}
          >
            This Week
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeFilter === 'day' ? 'bg-pink-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            onClick={() => setTimeFilter('day')}
          >
            Today
          </button>
        </div>
        
        {/* Leaderboard Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden p-6">
          <LeaderboardTable />
        </div>
        
        {/* Join CTA */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Want to see your name on the leaderboard?</h2>
          <p className="text-gray-400 mb-6">
            Start playing games with your cashback rewards and climb the rankings!
          </p>
          <Link href="/games"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-pink-600 text-white font-medium shadow-lg hover:bg-pink-700 transition-colors"
          >
            Play Now
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 