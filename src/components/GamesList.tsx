"use client";

import React, { useState } from "react";
import { useData, Game } from "@/lib/contexts/DataContext";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";

const GamesList = () => {
  const { games, loadingGames } = useData();
  const { user, userProfile } = useAuth();

  if (loadingGames) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No Games Available</h3>
        <p className="text-gray-500">Check back later for new games!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

const GameCard = ({ game }: { game: Game }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image 
          src={game.imageUrl || "https://placehold.co/400x200?text=Game"} 
          alt={game.name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold">{game.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{game.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm">
            {game.minBet && (
              <span className="text-gray-500">
                Min Bet: {game.minBet} pts
              </span>
            )}
          </div>
          
          <Link 
            href={user ? `/games/${game.id}` : "/login?redirect=/games"}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {user ? "Play Now" : "Login to Play"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GamesList; 