"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export default function CrashPage() {
  const router = useRouter();
  
  // User & balance state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [formattedBalance, setFormattedBalance] = useState<string>('$0.00');
  
  // Game state
  const [betAmount, setBetAmount] = useState<number>(1);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasCashed, setHasCashed] = useState<boolean>(false);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([1.25, 3.87, 1.12, 5.46, 1.03]);
  const [error, setError] = useState<string>('');
  
  // Animation ref
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Load user and balance data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    const storedBalance = localStorage.getItem('balance');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      if (storedBalance) {
        const balanceValue = parseFloat(storedBalance);
        setBalance(balanceValue);
        setFormattedBalance(formatCurrency(balanceValue));
      }
    } else {
      router.push('/login');
    }
    
    setAuthLoading(false);
  }, [router]);
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Handle bet amount change
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setBetAmount(0);
    } else if (value > balance) {
      setBetAmount(balance);
    } else {
      setBetAmount(value);
    }
  };
  
  // Quick bet buttons
  const quickBet = (amount: number) => {
    if (amount <= balance) {
      setBetAmount(amount);
    } else {
      setBetAmount(balance);
    }
  };
  
  // Double bet button
  const doubleBet = () => {
    const doubled = betAmount * 2;
    if (doubled <= balance) {
      setBetAmount(doubled);
    } else {
      setBetAmount(balance);
    }
  };
  
  // Half bet button
  const halfBet = () => {
    const halved = betAmount / 2;
    if (halved >= 0.1) {
      setBetAmount(halved);
    } else {
      setBetAmount(0.1);
    }
  };
  
  // Max bet button
  const maxBet = () => {
    setBetAmount(balance);
  };
  
  // Function to deduct rewards
  const deductRewards = async (amount: number, game: string): Promise<boolean> => {
    try {
      // Check if user has enough balance
      if (balance < amount) return false;
      
      // Create a new transaction
      const transaction = {
        id: Date.now().toString(),
        amount: -amount,
        type: 'loss',
        game,
        description: `Bet placed on ${game}`,
        timestamp: new Date(),
      };
      
      // Update balance
      const newBalance = balance - amount;
      setBalance(newBalance);
      setFormattedBalance(formatCurrency(newBalance));
      
      // Update localStorage
      localStorage.setItem('balance', newBalance.toString());
      
      // Get existing transactions and add new one
      const storedTransactions = localStorage.getItem('transactions');
      let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      
      return true;
    } catch (error) {
      console.error("Error deducting rewards:", error);
      return false;
    }
  };
  
  // Function to add winnings
  const addWinning = async (amount: number, game: string, multiplier: number): Promise<boolean> => {
    try {
      // Create a new transaction
      const transaction = {
        id: Date.now().toString(),
        amount,
        type: 'win',
        game,
        description: `Won ${formatCurrency(amount)} on ${game} (${multiplier.toFixed(2)}x)`,
        timestamp: new Date(),
      };
      
      // Update balance
      const newBalance = balance + amount;
      setBalance(newBalance);
      setFormattedBalance(formatCurrency(newBalance));
      
      // Update localStorage
      localStorage.setItem('balance', newBalance.toString());
      
      // Get existing transactions and add new one
      const storedTransactions = localStorage.getItem('transactions');
      let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      
      return true;
    } catch (error) {
      console.error("Error adding winning:", error);
      return false;
    }
  };
  
  // Generate a crash point (minimum 1.00, with probabilities favoring lower numbers)
  const generateCrashPoint = (): number => {
    // Generate a random number between 0 and 1
    const rand = Math.random();
    
    // Use a formula that favors lower numbers but allows for occasional high multipliers
    // This uses an exponential distribution
    const crashPoint = 1.00 + Math.pow(rand, -0.43) / 10;
    
    // Randomly allow some very high crashes (about 1% of games)
    if (Math.random() < 0.01) {
      return 10 + Math.random() * 90; // Between 10x and 100x
    }
    
    return Math.min(crashPoint, 10); // Cap at 10x for most games
  };
  
  // Start the game
  const startGame = async () => {
    if (betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    if (betAmount > balance) {
      setError('Insufficient balance');
      return;
    }
    
    setError('');
    
    try {
      // Deduct bet amount from balance
      const success = await deductRewards(betAmount, 'Crash Game');
      
      if (!success) {
        setError('Failed to place bet. Please try again.');
        return;
      }
      
      // Reset game state
      setMultiplier(1.00);
      setIsPlaying(true);
      setHasCashed(false);
      setHasLost(false);
      setCashoutMultiplier(null);
      setWinAmount(0);
      
      // Generate crash point
      const newCrashPoint = generateCrashPoint();
      setCrashPoint(newCrashPoint);
      
      // Start animation
      startTimeRef.current = Date.now();
      animateMultiplier();
      
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };
  
  // Animate the multiplier increasing
  const animateMultiplier = () => {
    if (!startTimeRef.current) return;
    
    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedSeconds = elapsedMs / 1000;
    
    // Calculate new multiplier (growth gets faster over time)
    // This formula creates an exponential growth curve
    const newMultiplier = 1 + Math.pow(elapsedSeconds, 1.6) / 4;
    
    // Update multiplier
    setMultiplier(newMultiplier);
    
    // Check if crashed
    if (crashPoint && newMultiplier >= crashPoint) {
      // Game over - crashed
      setIsPlaying(false);
      setHasLost(true);
      
      // Add to history
      setHistory(prev => [parseFloat(crashPoint.toFixed(2)), ...prev.slice(0, 4)]);
      
      // Reset refs
      startTimeRef.current = null;
      animationRef.current = null;
      return;
    }
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animateMultiplier);
  };
  
  // Cash out
  const cashOut = async () => {
    if (!isPlaying) return;
    
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsPlaying(false);
    setHasCashed(true);
    setCashoutMultiplier(multiplier);
    
    // Calculate winnings
    const winnings = betAmount * multiplier;
    setWinAmount(winnings);
    
    // Add to balance
    await addWinning(winnings, 'Crash Game', multiplier);
    
    // Add to history when game ends (after cashout or crash)
    if (crashPoint) {
      setHistory(prev => [parseFloat(crashPoint.toFixed(2)), ...prev.slice(0, 4)]);
    }
  };
  
  // Color based on multiplier
  const getMultiplierColor = (multi: number): string => {
    if (multi < 1.5) return 'text-blue-500';
    if (multi < 2) return 'text-green-500';
    if (multi < 5) return 'text-yellow-500';
    if (multi < 10) return 'text-orange-500';
    return 'text-red-500';
  };
  
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-6 h-6 border-2 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/games" className="text-pink-500 hover:text-pink-400 transition flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Games
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Crash Game</h1>
        <p className="text-gray-400 mb-8">
          Watch the multiplier rise and cash out before it crashes to win big!
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Display */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center">
              {/* Multiplier */}
              <div className="mb-8 text-center">
                <div className={`text-8xl font-bold mb-2 ${getMultiplierColor(multiplier)}`}>
                  {multiplier.toFixed(2)}x
                </div>
                <div className="text-sm text-gray-400">
                  {isPlaying ? 'Game in progress...' : hasLost ? 'Crashed!' : hasCashed ? 'Cashed Out!' : 'Ready to play'}
                </div>
              </div>
              
              {/* Result Display */}
              {hasCashed && (
                <div className="text-center mb-6 p-4 rounded-lg bg-green-500/20 text-green-500">
                  <h3 className="text-2xl font-bold mb-2">
                    You Won!
                  </h3>
                  <p className="text-xl">
                    Cashed out at {cashoutMultiplier?.toFixed(2)}x
                  </p>
                  <p className="text-xl">
                    +{formatCurrency(winAmount)}
                  </p>
                </div>
              )}
              
              {hasLost && (
                <div className="text-center mb-6 p-4 rounded-lg bg-red-500/20 text-red-500">
                  <h3 className="text-2xl font-bold mb-2">
                    You Lost!
                  </h3>
                  <p className="text-xl">
                    Crashed at {crashPoint?.toFixed(2)}x
                  </p>
                </div>
              )}
              
              {/* Cashout Button */}
              {isPlaying ? (
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-64 h-16 text-xl" 
                  onClick={cashOut}
                >
                  Cash Out ({formatCurrency(betAmount * multiplier)})
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-64 h-16 text-xl" 
                  onClick={startGame}
                  disabled={betAmount <= 0 || betAmount > balance}
                >
                  Start Game
                </Button>
              )}
              
              {/* Recent Games */}
              <div className="mt-8 w-full">
                <h3 className="text-center text-lg font-semibold mb-2">Recent Crashes</h3>
                <div className="flex justify-center space-x-2">
                  {history.map((point, index) => (
                    <div 
                      key={index} 
                      className={`w-16 h-10 rounded flex items-center justify-center text-sm font-medium ${
                        point < 1.5 ? 'bg-blue-500/20 text-blue-500' :
                        point < 2 ? 'bg-green-500/20 text-green-500' :
                        point < 5 ? 'bg-yellow-500/20 text-yellow-500' :
                        point < 10 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {point.toFixed(2)}x
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bet Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Place Your Bet</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="betAmount" className="block text-sm font-medium mb-2">
                Bet Amount
              </label>
              <div className="relative">
                <input
                  id="betAmount"
                  type="number"
                  min="0.1"
                  step="0.1"
                  max={balance}
                  value={betAmount}
                  onChange={handleBetChange}
                  className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 pr-10 text-white shadow-sm focus:ring-2 focus:ring-inset focus:ring-pink-500 sm:text-sm"
                  disabled={isPlaying}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400">$</span>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                Balance: {formattedBalance}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(1)}
                disabled={isPlaying}
              >
                $1
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(5)}
                disabled={isPlaying}
              >
                $5
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(10)}
                disabled={isPlaying}
              >
                $10
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(25)}
                disabled={isPlaying}
              >
                $25
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={halfBet}
                disabled={isPlaying}
              >
                1/2
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={doubleBet}
                disabled={isPlaying}
              >
                2x
              </Button>
            </div>
            
            <div className="mb-6">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={maxBet}
                disabled={isPlaying}
              >
                Max Bet
              </Button>
            </div>
            
            <div className="bg-gray-700 rounded-md p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Potential Win at 2x:</span>
                <span className="font-bold">{formatCurrency(betAmount * 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential Win at 5x:</span>
                <span className="font-bold">{formatCurrency(betAmount * 5)}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400 p-4 bg-gray-700/50 rounded-md">
              <h3 className="font-medium text-white mb-2">How to Play</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter your bet amount</li>
                <li>Click "Start Game" to begin</li>
                <li>Watch the multiplier increase</li>
                <li>Cash out before the game crashes</li>
                <li>The longer you wait, the more you win!</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 