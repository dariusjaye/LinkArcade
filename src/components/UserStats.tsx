"use client";

import React from "react";
import { useData } from "@/lib/contexts/DataContext";
import { useAuth } from "@/lib/hooks/useAuth";

const UserStats = () => {
  const { userStats, loadingUserStats } = useData();
  const { user, userProfile } = useAuth();

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
        <p className="text-gray-500">Please log in to view your stats.</p>
      </div>
    );
  }

  if (loadingUserStats) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Stats</h3>
        {userProfile && (
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {userProfile.points.toLocaleString()} points
          </div>
        )}
      </div>

      {userStats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard 
            title="Games Played" 
            value={userStats.totalGamesPlayed} 
            icon="🎮"
          />
          <StatCard 
            title="Wins" 
            value={userStats.totalWins} 
            percentage={userStats.totalGamesPlayed > 0 ? (userStats.totalWins / userStats.totalGamesPlayed * 100).toFixed(1) : "0"}
            icon="🏆"
          />
          <StatCard 
            title="Losses" 
            value={userStats.totalLosses} 
            percentage={userStats.totalGamesPlayed > 0 ? (userStats.totalLosses / userStats.totalGamesPlayed * 100).toFixed(1) : "0"}
            icon="❌"
          />
          <StatCard 
            title="Total Bet" 
            value={userStats.totalBetAmount.toLocaleString()} 
            icon="💰"
            suffix="pts"
          />
          <StatCard 
            title="Total Won" 
            value={userStats.totalWinAmount.toLocaleString()} 
            icon="💎"
            suffix="pts"
          />
          <StatCard 
            title="Net Profit" 
            value={(userStats.totalWinAmount - userStats.totalBetAmount).toLocaleString()} 
            isPositive={userStats.totalWinAmount - userStats.totalBetAmount >= 0}
            icon="📊"
            suffix="pts"
          />
        </div>
      ) : (
        <p className="text-gray-500">No stats available yet. Play some games!</p>
      )}
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  percentage, 
  icon,
  suffix = "",
  isPositive
}: { 
  title: string; 
  value: number | string; 
  percentage?: string;
  icon: string;
  suffix?: string;
  isPositive?: boolean;
}) => {
  let valueColor = "text-gray-800";
  
  if (isPositive !== undefined) {
    valueColor = isPositive ? "text-green-600" : "text-red-600";
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {percentage && (
          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            {percentage}%
          </span>
        )}
      </div>
      <h4 className="text-sm font-medium text-gray-500 mt-2">{title}</h4>
      <p className={`text-xl font-bold ${valueColor}`}>
        {value}{suffix}
      </p>
    </div>
  );
};

export default UserStats; 