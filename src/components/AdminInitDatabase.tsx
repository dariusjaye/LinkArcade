"use client";

import React, { useState } from 'react';
import { initializeFirestore } from '@/lib/firebase/initFirestore';

const AdminInitDatabase = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInitDatabase = async () => {
    try {
      setIsInitializing(true);
      setInitResult(null);

      const success = await initializeFirestore();
      
      setInitResult({
        success,
        message: success 
          ? "Database initialized successfully with sample data!" 
          : "Failed to initialize database. Check console for errors."
      });
    } catch (error) {
      console.error("Error initializing database:", error);
      setInitResult({
        success: false,
        message: `Error initializing database: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Database Initialization</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Use this button to initialize the Firebase Firestore database with sample data for testing.
        This will create collections for games, rewards, and leaderboard if they don&apos;t exist.
      </p>
      
      <button
        onClick={handleInitDatabase}
        disabled={isInitializing}
        className={`px-4 py-2 rounded-md font-medium ${
          isInitializing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isInitializing ? 'Initializing...' : 'Initialize Database'}
      </button>
      
      {initResult && (
        <div className={`mt-4 p-3 rounded-md ${
          initResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {initResult.message}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <h3 className="font-semibold mb-1">This will create:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>3 sample games (Coin Flip, Dice Roll, Roulette)</li>
          <li>3 sample rewards (Gift Card, Premium Membership, Merchandise)</li>
          <li>3 dummy leaderboard entries</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminInitDatabase; 