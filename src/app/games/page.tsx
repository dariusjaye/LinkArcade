"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';

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

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Load games from localStorage if available (admin settings)
    const storedGames = localStorage.getItem('adminGameSettings');
    
    if (storedGames) {
      setGames(JSON.parse(storedGames));
      setLoading(false);
    } else {
      // Default games if no stored games
      const defaultGames: Game[] = [
        {
          id: 'coinflip',
          name: 'Coin Flip',
          description: 'Double your rewards with a 50/50 chance of winning. Simple, fast, and exciting!',
          gradientFrom: 'from-pink-500',
          gradientTo: 'to-purple-600',
          minBet: 0.1,
          maxBet: 100,
          multiplier: '2x',
          popular: true,
          implemented: true,
          badge: 'Ready to Play'
        },
        {
          id: 'roulette',
          name: 'Roulette',
          description: 'Test your luck on the spinning wheel with multiple betting options.',
          gradientFrom: 'from-green-500',
          gradientTo: 'to-cyan-600',
          minBet: 0.5,
          maxBet: 200,
          multiplier: 'Up to 36x',
          popular: true,
          implemented: true,
          badge: 'Ready to Play'
        },
        {
          id: 'crash',
          name: 'Crash',
          description: 'Watch the multiplier rise and cash out before it crashes to win big!',
          gradientFrom: 'from-red-500',
          gradientTo: 'to-yellow-600',
          minBet: 1,
          maxBet: 500,
          multiplier: 'Unlimited',
          popular: true,
          implemented: true,
          badge: 'Ready to Play'
        },
        {
          id: 'slots',
          name: 'Slots',
          description: 'Spin the reels and match symbols to win big. Classic casino slots experience!',
          gradientFrom: 'from-purple-500',
          gradientTo: 'to-pink-600',
          minBet: 0.5,
          maxBet: 100,
          multiplier: 'Up to 500x',
          popular: false,
          implemented: true,
          badge: 'Ready to Play'
        },
        {
          id: 'crackthecode',
          name: 'Crack the Code',
          description: 'Use logical deduction to guess the 4-digit code before running out of attempts.',
          gradientFrom: 'from-indigo-500',
          gradientTo: 'to-cyan-400',
          minBet: 0.1,
          maxBet: 100,
          multiplier: 'Up to 5x',
          popular: true,
          implemented: true,
          badge: 'Ready to Play'
        },
        {
          id: 'dice',
          name: 'Dice',
          description: 'Roll the dice and win big based on your prediction. Choose your odds and risk!',
          gradientFrom: 'from-blue-500',
          gradientTo: 'to-indigo-600',
          minBet: 0.1,
          maxBet: 300,
          multiplier: '1.01x to 495x',
          popular: false,
          implemented: false,
          badge: 'Coming Soon'
        },
        {
          id: 'blackjack',
          name: 'Blackjack',
          description: 'Try to get as close to 21 as possible without going over. Beat the dealer to win!',
          gradientFrom: 'from-yellow-500',
          gradientTo: 'to-red-600',
          minBet: 1,
          maxBet: 500,
          multiplier: '2x',
          popular: false,
          implemented: false,
          badge: 'Coming Soon'
        },
      ];
      
      setGames(defaultGames);
      setLoading(false);
    }
  }, []);

  const filteredGames = games.filter(game => {
    if (filter === 'popular') return game.popular;
    if (filter === 'available') return game.implemented;
    if (filter === 'coming-soon') return !game.implemented;
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Games</h1>
          <p className="text-gray-400">
            Explore our collection of exciting games with various betting options
          </p>
        </div>
        
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
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
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
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
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 