"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/lib/contexts/SiteSettingsContext';
import { useAuth } from '@/lib/hooks/useAuth';

interface FeaturedGame {
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
}

export default function Home() {
  const [featuredGames, setFeaturedGames] = useState<FeaturedGame[]>([]);
  const { settings } = useSiteSettings();
  const { user } = useAuth();

  useEffect(() => {
    // Load featured games from localStorage if available
    const storedGames = localStorage.getItem('adminGameSettings');
    
    if (storedGames) {
      const allGames = JSON.parse(storedGames);
      // Filter for popular games that are implemented
      const popular = allGames.filter(
        (game: FeaturedGame) => game.popular && game.implemented
      ).slice(0, 3); // Get top 3
      
      setFeaturedGames(popular);
    } else {
      // Default featured games
      setFeaturedGames([
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
          badge: 'Popular'
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
          badge: 'Popular'
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
          badge: 'Popular'
        },
      ]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
          {/* Background */}
          <div 
            className="absolute inset-0 bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${settings.heroBackgroundUrl})`,
              opacity: 0.4
            }}
          ></div>
          <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-${settings.primaryColor}-500 to-${settings.secondaryColor}-600`}>
                {settings.heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                {settings.heroSubtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {user ? (
                  <Link href="/games">
                    <Button variant="default" size="lg">
                      Start Playing
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="default" size="lg">
                      Sign Up & Play
                    </Button>
                  </Link>
                )}
                <Link href="/rewards">
                  <Button variant="outline" size="lg">
                    Learn About Rewards
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free To Play</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Real Cash Rewards</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure & Trusted</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Games */}
        <section className="py-16 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 text-${settings.primaryColor}-500`}>Featured Games</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Choose from our selection of exciting games and turn your rewards into big winnings
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredGames.map(game => (
                <div key={game.id} className="bg-gray-900 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-pink-500/20 hover:translate-y-[-4px]">
                  <div className={`h-48 ${game.imageUrl ? '' : `bg-gradient-to-br ${game.gradientFrom} ${game.gradientTo}`} relative`}>
                    {game.imageUrl ? (
                      <img 
                        src={game.imageUrl} 
                        alt={game.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between bg-black bg-opacity-30">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-white">{game.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-pink-600">
                          {game.badge}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium bg-black bg-opacity-30 rounded px-2 py-1">
                          {game.multiplier}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-300 mb-6 h-16">
                      {game.description}
                    </p>
                    <Link href={`/games/${game.id}`}>
                      <Button variant="default" className="w-full">
                        Play Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/games">
                <Button variant="outline" size="lg">
                  View All Games
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Turn your shopping cashback into playable tokens and win real money
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-lg bg-gray-800">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
                <p className="text-gray-400">
                  Earn cashback rewards from your shopping that you can use to play games
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-gray-800">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Play & Win</h3>
                <p className="text-gray-400">
                  Play exciting games with your rewards and multiply your earnings
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-gray-800">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Cash Out</h3>
                <p className="text-gray-400">
                  Withdraw your winnings directly to your bank account or crypto wallet
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-pink-600 to-purple-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Play and Win?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join LinkArcade today and turn your rewards into exciting gaming experiences and real cash prizes
            </p>
            {user ? (
              <Link href="/games">
                <Button variant="default" size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
                  Start Playing Now
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default" size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
                  Sign Up Free
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
