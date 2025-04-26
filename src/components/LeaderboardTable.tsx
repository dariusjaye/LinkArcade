"use client";

import React from "react";
import { useData, Leaderboard } from "@/lib/contexts/DataContext";
import Image from "next/image";

const LeaderboardTable = () => {
  const { leaderboard, loadingLeaderboard } = useData();

  if (loadingLeaderboard) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
        <p className="text-gray-500">Be the first to join the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Rank</th>
            <th className="py-3 px-4 text-left">Player</th>
            <th className="py-3 px-4 text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leaderboard.map((player) => (
            <LeaderboardRow key={player.id} player={player} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LeaderboardRow = ({ player }: { player: Leaderboard }) => {
  // Determine rank badge color
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500"; // Gold
    if (rank === 2) return "bg-gray-300"; // Silver
    if (rank === 3) return "bg-amber-600"; // Bronze
    return "bg-gray-200";
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${getRankColor(player.rank)}`}>
          {player.rank}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          {player.photoURL ? (
            <div className="relative w-8 h-8 mr-3">
              <Image
                src={player.photoURL}
                alt={player.displayName || "Player"}
                fill
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-sm">
                {(player.displayName || "?").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-medium">{player.displayName || "Anonymous"}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right font-semibold">
        {player.points.toLocaleString()} pts
      </td>
    </tr>
  );
};

export default LeaderboardTable; 