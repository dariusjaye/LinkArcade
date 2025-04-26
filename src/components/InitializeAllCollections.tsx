"use client";

import React, { useState } from 'react';
import { initializeAllCollections } from '@/lib/firebase/initAllCollections';

const InitializeAllCollections = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInitCollections = async () => {
    try {
      setIsInitializing(true);
      setInitResult(null);

      const success = await initializeAllCollections();
      
      setInitResult({
        success,
        message: success 
          ? "All Firestore collections initialized successfully with sample data!" 
          : "Failed to initialize collections. Check console for errors."
      });
    } catch (error) {
      console.error("Error initializing collections:", error);
      setInitResult({
        success: false,
        message: `Error initializing collections: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Initialize All Firestore Collections</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Use this button to initialize all Firestore collections with sample data.
        This will create the following collections if they don&apos;t exist:
      </p>
      
      <ul className="list-disc list-inside mb-4 text-gray-600 dark:text-gray-300">
        <li>users - User accounts</li>
        <li>games - Available games</li>
        <li>gamePlays - Game play history</li>
        <li>userStats - User statistics</li>
        <li>leaderboard - Points leaderboard</li>
        <li>rewards - Available rewards</li>
        <li>userRewards - Redeemed user rewards</li>
      </ul>
      
      <button
        onClick={handleInitCollections}
        disabled={isInitializing}
        className={`px-4 py-2 rounded-md font-medium ${
          isInitializing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isInitializing ? 'Initializing...' : 'Initialize All Collections'}
      </button>
      
      {initResult && (
        <div className={`mt-4 p-3 rounded-md ${
          initResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {initResult.message}
        </div>
      )}
    </div>
  );
};

export default InitializeAllCollections; 