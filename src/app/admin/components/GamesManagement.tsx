"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import GameEditor from './GameEditor';

// Define the game settings interface
export interface GameSettings {
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

export default function GamesManagement() {
  const [games, setGames] = useState<GameSettings[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load games from localStorage on mount
  useEffect(() => {
    const loadGames = () => {
      const storedGames = localStorage.getItem('adminGameSettings');
      
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      } else {
        // If no stored games, load default games from the games page
        const defaultGames = [
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
            badge: 'Ready to Play',
            customSettings: {
              winChance: 50,
              animationDuration: 2000
            }
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
            badge: 'Ready to Play',
            customSettings: {
              wheelSpeed: 3000,
              includeZero: true
            }
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
            badge: 'Ready to Play',
            customSettings: {
              growthRate: 1.6,
              highMultiplierChance: 1
            }
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
            badge: 'Ready to Play',
            customSettings: {
              reelCount: 9,
              spinDuration: 1000
            }
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
        localStorage.setItem('adminGameSettings', JSON.stringify(defaultGames));
      }
      
      setLoading(false);
    };
    
    loadGames();
  }, []);
  
  // Save games to localStorage
  const saveGames = (updatedGames: GameSettings[]) => {
    localStorage.setItem('adminGameSettings', JSON.stringify(updatedGames));
    setGames(updatedGames);
  };
  
  // Update a specific game
  const updateGame = (updatedGame: GameSettings) => {
    const updatedGames = games.map(game => 
      game.id === updatedGame.id ? updatedGame : game
    );
    
    saveGames(updatedGames);
    setSelectedGame(null);
  };
  
  // Make a game featured (popular)
  const toggleFeatured = (gameId: string) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return { ...game, popular: !game.popular };
      }
      return game;
    });
    
    saveGames(updatedGames);
  };
  
  // Toggle game implementation status
  const toggleImplemented = (gameId: string) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return { 
          ...game, 
          implemented: !game.implemented,
          badge: !game.implemented ? 'Ready to Play' : 'Coming Soon'
        };
      }
      return game;
    });
    
    saveGames(updatedGames);
  };
  
  if (loading) {
    return <div className="p-8 text-center">Loading games...</div>;
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Games Management</h2>
      <p className="text-gray-400 mb-6">
        Customize game settings, appearance, and parameters
      </p>
      
      {selectedGame ? (
        <GameEditor 
          game={selectedGame} 
          onSave={updateGame} 
          onCancel={() => setSelectedGame(null)} 
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Bet Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Multiplier
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {games.map(game => (
                <tr key={game.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded mr-3 bg-gradient-to-br ${game.gradientFrom} ${game.gradientTo}`}></div>
                      <div>
                        <div className="font-medium">{game.name}</div>
                        <div className="text-xs text-gray-400">{game.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        game.implemented ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {game.implemented ? 'Active' : 'Coming Soon'}
                      </span>
                      <span className={`text-xs mt-1 ${game.popular ? 'text-pink-400' : 'text-gray-400'}`}>
                        {game.popular ? 'Featured' : 'Not Featured'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    ${game.minBet} - ${game.maxBet}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {game.multiplier}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setSelectedGame(game)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant={game.popular ? "default" : "outline"} 
                      size="sm"
                      onClick={() => toggleFeatured(game.id)}
                    >
                      {game.popular ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button 
                      variant={game.implemented ? "success" : "secondary"} 
                      size="sm"
                      onClick={() => toggleImplemented(game.id)}
                    >
                      {game.implemented ? 'Disable' : 'Enable'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 