"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

// Roulette number colors
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

type BetType = 'red' | 'black' | 'even' | 'odd' | 'high' | 'low' | 'number';

interface PlacedBet {
  type: BetType;
  amount: number;
  number?: number;
  multiplier: number;
}

export default function RoulettePage() {
  const router = useRouter();
  
  // User & balance state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [formattedBalance, setFormattedBalance] = useState<string>('$0.00');
  
  // Game state
  const [betAmount, setBetAmount] = useState<number>(1);
  const [currentBetType, setCurrentBetType] = useState<BetType>('red');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [totalBetAmount, setTotalBetAmount] = useState<number>(0);
  
  // Spin state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const [winnings, setWinnings] = useState<number>(0);
  const [error, setError] = useState<string>('');
  
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
  
  // Get multiplier based on bet type
  const getMultiplier = (type: BetType): number => {
    switch (type) {
      case 'red':
      case 'black':
      case 'even':
      case 'odd':
      case 'high':
      case 'low':
        return 2; // 1:1 payout
      case 'number':
        return 36; // 35:1 payout
      default:
        return 2;
    }
  };
  
  // Add a bet
  const addBet = () => {
    if (betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    if (betAmount > balance) {
      setError('Insufficient balance');
      return;
    }
    
    if (currentBetType === 'number' && selectedNumber === null) {
      setError('Please select a number');
      return;
    }
    
    const multiplier = getMultiplier(currentBetType);
    const newBet: PlacedBet = {
      type: currentBetType,
      amount: betAmount,
      multiplier
    };
    
    if (currentBetType === 'number') {
      newBet.number = selectedNumber!;
    }
    
    // Add bet to placed bets
    setPlacedBets([...placedBets, newBet]);
    
    // Update total bet amount
    setTotalBetAmount(totalBetAmount + betAmount);
    
    // Reset selected number if needed
    if (currentBetType === 'number') {
      setSelectedNumber(null);
    }
    
    setError('');
  };
  
  // Clear all bets
  const clearBets = () => {
    setPlacedBets([]);
    setTotalBetAmount(0);
    setSelectedNumber(null);
    setError('');
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
        description: `Won ${formatCurrency(amount)} on ${game} (${multiplier}x)`,
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
  
  // Check if a bet wins
  const checkBetWin = (bet: PlacedBet, resultNumber: number): boolean => {
    switch (bet.type) {
      case 'red':
        return RED_NUMBERS.includes(resultNumber);
      case 'black':
        return BLACK_NUMBERS.includes(resultNumber);
      case 'even':
        return resultNumber !== 0 && resultNumber % 2 === 0;
      case 'odd':
        return resultNumber !== 0 && resultNumber % 2 === 1;
      case 'high':
        return resultNumber >= 19 && resultNumber <= 36;
      case 'low':
        return resultNumber >= 1 && resultNumber <= 18;
      case 'number':
        return resultNumber === bet.number;
      default:
        return false;
    }
  };
  
  // Spin the wheel
  const spinWheel = async () => {
    if (placedBets.length === 0) {
      setError('Please place at least one bet');
      return;
    }
    
    if (totalBetAmount > balance) {
      setError('Insufficient balance');
      return;
    }
    
    setError('');
    setIsSpinning(true);
    setResult(null);
    setWinnings(0);
    
    try {
      // Deduct total bet amount from balance
      const success = await deductRewards(totalBetAmount, 'Roulette');
      
      if (!success) {
        setError('Failed to place bets. Please try again.');
        setIsSpinning(false);
        return;
      }
      
      // Generate random result (0-36)
      setTimeout(async () => {
        const resultNumber = Math.floor(Math.random() * 37);
        setResult(resultNumber);
        
        // Calculate winnings
        let totalWinnings = 0;
        
        for (const bet of placedBets) {
          if (checkBetWin(bet, resultNumber)) {
            totalWinnings += bet.amount * bet.multiplier;
          }
        }
        
        setWinnings(totalWinnings);
        
        // Add winnings if any
        if (totalWinnings > 0) {
          await addWinning(totalWinnings, 'Roulette', totalWinnings / totalBetAmount);
        }
        
        setIsSpinning(false);
      }, 3000);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsSpinning(false);
    }
  };
  
  // Get color class for number
  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-900';
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
        
        <h1 className="text-3xl font-bold mb-2">Roulette</h1>
        <p className="text-gray-400 mb-8">
          Test your luck on the spinning wheel with multiple betting options.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roulette Wheel */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col items-center">
              {/* Wheel */}
              <div className="mb-8 relative w-64 h-64">
                <div className={`w-full h-full rounded-full relative flex items-center justify-center ${isSpinning ? 'animate-spin-slow' : ''} bg-gradient-to-r from-red-600 via-black to-red-600`}>
                  {!isSpinning && result !== null && (
                    <div className={`absolute inset-0 flex items-center justify-center ${getNumberColor(result)} rounded-full border-4 border-white`}>
                      <span className="text-4xl font-bold">{result}</span>
                    </div>
                  )}
                  {!isSpinning && result === null && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                      ?
                    </div>
                  )}
                </div>
              </div>
              
              {/* Result Display */}
              {result !== null && !isSpinning && (
                <div className={`text-center mb-6 p-4 rounded-lg ${winnings > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  <h3 className="text-2xl font-bold mb-2">
                    {winnings > 0 ? 'You Won!' : 'You Lost!'}
                  </h3>
                  {winnings > 0 && (
                    <p className="text-xl">
                      +{formatCurrency(winnings)}
                    </p>
                  )}
                </div>
              )}
              
              {/* Betting Board */}
              <div className="w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-center">Betting Options</h3>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <button
                    className={`h-12 rounded-md flex items-center justify-center ${
                      currentBetType === 'red' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentBetType('red')}
                    disabled={isSpinning}
                  >
                    Red
                  </button>
                  <button
                    className={`h-12 rounded-md flex items-center justify-center ${
                      currentBetType === 'black' 
                        ? 'bg-gray-900 text-white border border-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentBetType('black')}
                    disabled={isSpinning}
                  >
                    Black
                  </button>
                  <button
                    className={`h-12 rounded-md flex items-center justify-center ${
                      currentBetType === 'number' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentBetType('number')}
                    disabled={isSpinning}
                  >
                    Number
                  </button>
                  <button
                    className={`h-12 rounded-md flex items-center justify-center ${
                      currentBetType === 'even' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentBetType('even')}
                    disabled={isSpinning}
                  >
                    Even
                  </button>
                  <button
                    className={`h-12 rounded-md flex items-center justify-center ${
                      currentBetType === 'odd' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentBetType('odd')}
                    disabled={isSpinning}
                  >
                    Odd
                  </button>
                  <button
                    className={`h-12 rounded-md flex items-center justify-center ${
                      currentBetType === 'low' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentBetType('low')}
                    disabled={isSpinning}
                  >
                    1-18
                  </button>
                  <button
                    className={`h-12 rounded-md flex items-center justify-center ${
                      currentBetType === 'high' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentBetType('high')}
                    disabled={isSpinning}
                  >
                    19-36
                  </button>
                </div>
                
                {/* Number selector (shown only when number bet type is selected) */}
                {currentBetType === 'number' && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Select a Number (0-36)</h4>
                    <div className="grid grid-cols-6 gap-1">
                      <button 
                        className={`h-8 rounded-md flex items-center justify-center bg-green-600 text-white ${selectedNumber === 0 ? 'ring-2 ring-white' : ''}`}
                        onClick={() => setSelectedNumber(0)}
                        disabled={isSpinning}
                      >
                        0
                      </button>
                      {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                        <button
                          key={num}
                          className={`h-8 rounded-md flex items-center justify-center ${RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-900'} text-white ${selectedNumber === num ? 'ring-2 ring-white' : ''}`}
                          onClick={() => setSelectedNumber(num)}
                          disabled={isSpinning}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Placed Bets */}
                {placedBets.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Your Bets</h4>
                    <div className="bg-gray-700 rounded-md p-3 space-y-2 max-h-40 overflow-auto">
                      {placedBets.map((bet, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>
                            {bet.type === 'number' ? `Number ${bet.number}` : bet.type.charAt(0).toUpperCase() + bet.type.slice(1)}
                          </span>
                          <div className="flex items-center">
                            <span className="mr-2">{formatCurrency(bet.amount)}</span>
                            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                              {bet.multiplier}x
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  disabled={isSpinning}
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
                disabled={isSpinning}
              >
                $1
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(5)}
                disabled={isSpinning}
              >
                $5
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(10)}
                disabled={isSpinning}
              >
                $10
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(25)}
                disabled={isSpinning}
              >
                $25
              </Button>
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-2">
              <Button 
                variant="default" 
                className="w-full" 
                onClick={addBet}
                disabled={isSpinning || betAmount <= 0 || betAmount > balance || (currentBetType === 'number' && selectedNumber === null)}
              >
                Add Bet
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={clearBets}
                disabled={isSpinning || placedBets.length === 0}
              >
                Clear Bets
              </Button>
            </div>
            
            <div className="bg-gray-700 rounded-md p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Total Bet:</span>
                <span className="font-bold">{formatCurrency(totalBetAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential Win:</span>
                <span className="font-bold">Varies by bet</span>
              </div>
            </div>
            
            <Button 
              variant="default" 
              size="lg" 
              className="w-full" 
              onClick={spinWheel}
              disabled={isSpinning || placedBets.length === 0 || totalBetAmount > balance}
              loading={isSpinning}
            >
              {isSpinning ? 'Spinning...' : 'Spin Wheel'}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 