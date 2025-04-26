"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

// Game interface
interface Game {
  id: string;
  name: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  minBet: number;
  maxBet: number;
  multiplier: string;
  popular: boolean;
  implemented: boolean;
  badge: string;
  imageUrl?: string;
  customSettings?: Record<string, any>;
}

export default function FirebaseGamesList() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Create a query against the games collection
    const q = query(collection(db, "games"));
    
    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const gamesData: Game[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        gamesData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          gradientFrom: data.gradientFrom || 'from-pink-500',
          gradientTo: data.gradientTo || 'to-purple-600',
          minBet: data.minBet || 0.1,
          maxBet: data.maxBet || 100,
          multiplier: data.multiplier || '2x',
          popular: data.popular || false,
          implemented: data.implemented || false,
          badge: data.implemented ? 'Ready to Play' : 'Coming Soon',
          imageUrl: data.imageUrl,
          customSettings: data.customSettings,
        });
      });
      setGames(gamesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching games:", error);
      setLoading(false);
      // Fall back to local storage if Firebase fails
      const storedGames = localStorage.getItem('adminGameSettings');
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      } else {
        setGames([]); // No games available
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  const filteredGames = games.filter(game => {
    if (filter === 'popular') return game.popular;
    if (filter === 'available') return game.implemented;
    if (filter === 'coming-soon') return !game.implemented;
    return true; // 'all'
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        <Button 
          variant={filter === 'all' ? "default" : "outline"} 
          onClick={() => setFilter('all')}
        >
          All Games
        </Button>
        <Button 
          variant={filter === 'popular' ? "default" : "outline"} 
          onClick={() => setFilter('popular')}
        >
          Popular
        </Button>
        <Button 
          variant={filter === 'available' ? "default" : "outline"} 
          onClick={() => setFilter('available')}
        >
          Available Now
        </Button>
        <Button 
          variant={filter === 'coming-soon' ? "default" : "outline"} 
          onClick={() => setFilter('coming-soon')}
        >
          Coming Soon
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <div key={game.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:transform hover:scale-105">
                <div className={`h-40 ${game.imageUrl ? '' : `bg-gradient-to-br ${game.gradientFrom} ${game.gradientTo}`} relative`}>
                  {game.imageUrl ? (
                    <img 
                      src={game.imageUrl} 
                      alt={game.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between bg-black bg-opacity-30">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold text-white">{game.name}</h2>
                      {game.popular && (
                        <span className="bg-white text-pink-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium bg-black bg-opacity-30 rounded px-2 py-1">
                        {game.multiplier}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300 mb-4">
                    {game.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-400">
                      Bet: ${game.minBet} - ${game.maxBet}
                    </div>
                    
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      game.implemented 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {game.badge}
                    </div>
                  </div>
                  
                  {game.implemented ? (
                    <Link href={`/games/${game.id}`}>
                      <Button variant="default" className="w-full">
                        Play Now
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-xl text-gray-400">No games found. Please check back later!</p>
            </div>
          )}
        </div>
      )}
    </>
  );
} 