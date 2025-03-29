"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export default function CoinFlipPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [formattedBalance, setFormattedBalance] = useState<string>('$0.00');
  
  const [betAmount, setBetAmount] = useState<number>(1);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [error, setError] = useState('');
  
  // Coin appearance settings
  const [gameSettings, setGameSettings] = useState({
    headsSideText: 'H',
    tailsSideText: 'T',
    headsSideColor: 'bg-yellow-500',
    tailsSideColor: 'bg-yellow-400',
    textColor: 'text-yellow-900',
    winChance: 50,
    animationDuration: 2000,
    coinEdgeVisible: true,
    coinRidgesVisible: true,
    coinEmbossLevel: 'medium',
    coinShineEffect: 'light',
    coinSound: 'classic',
    headsImageUrl: '',
    tailsImageUrl: '',
    useCustomImages: false
  });
  
  // Audio references
  const [flipSound, setFlipSound] = useState<HTMLAudioElement | null>(null);
  const [winSound, setWinSound] = useState<HTMLAudioElement | null>(null);
  
  // Confetti state
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
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
  
  // Load game settings from localStorage
  useEffect(() => {
    const loadGameSettings = () => {
      const storedGames = localStorage.getItem('adminGameSettings');
      if (storedGames) {
        const games = JSON.parse(storedGames);
        const coinflipGame = games.find((game: any) => game.id === 'coinflip');
        
        if (coinflipGame && coinflipGame.customSettings) {
          setGameSettings({
            headsSideText: coinflipGame.customSettings.headsSideText || 'H',
            tailsSideText: coinflipGame.customSettings.tailsSideText || 'T',
            headsSideColor: coinflipGame.customSettings.headsSideColor || 'bg-yellow-500',
            tailsSideColor: coinflipGame.customSettings.tailsSideColor || 'bg-yellow-400',
            textColor: coinflipGame.customSettings.textColor || 'text-yellow-900',
            winChance: coinflipGame.customSettings.winChance || 50,
            animationDuration: coinflipGame.customSettings.animationDuration || 2000,
            coinEdgeVisible: coinflipGame.customSettings.coinEdgeVisible !== false,
            coinRidgesVisible: coinflipGame.customSettings.coinRidgesVisible !== false,
            coinEmbossLevel: coinflipGame.customSettings.coinEmbossLevel || 'medium',
            coinShineEffect: coinflipGame.customSettings.coinShineEffect || 'light',
            coinSound: coinflipGame.customSettings.coinSound || 'classic',
            headsImageUrl: coinflipGame.customSettings.headsImageUrl || '',
            tailsImageUrl: coinflipGame.customSettings.tailsImageUrl || '',
            useCustomImages: coinflipGame.customSettings.useCustomImages || false
          });
        }
      }
    };
    
    loadGameSettings();
  }, []);
  
  // Initialize sound effects
  useEffect(() => {
    // Create audio elements
    if (typeof window !== 'undefined') {
      const flip = new Audio();
      const win = new Audio();
      
      // Set sources based on selected sound
      flip.src = getSoundPath(gameSettings.coinSound);
      win.src = '/sounds/win.mp3'; // Default win sound
      
      // Set to state
      setFlipSound(flip);
      setWinSound(win);
    }
    
    return () => {
      // Cleanup
      if (flipSound) {
        flipSound.pause();
        flipSound.currentTime = 0;
      }
      if (winSound) {
        winSound.pause();
        winSound.currentTime = 0;
      }
    };
  }, [gameSettings.coinSound]);
  
  // Initialize confetti
  useEffect(() => {
    let confettiAnimation: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      velocity: {
        x: number;
        y: number;
      };
      rotation: number;
      rotationSpeed: number;
      shape: 'circle' | 'square' | 'triangle' | 'line';
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
      gravity: number;
      decay: number;
    }> = [];
    
    if (showConfetti && confettiCanvasRef.current) {
      const canvas = confettiCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Set canvas size to match window
      const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      setCanvasSize();
      window.addEventListener('resize', setCanvasSize);
      
      // Rich color palette with bright celebratory colors
      const colors = [
        '#FF577F', '#FF884B', '#FFBD9B', '#F9F871', // Warm celebratory colors
        '#05C7F2', '#01BAEF', '#0CAADC', '#53D8FB', // Cool blues
        '#9D5CFF', '#C13DFF', '#C875FF', '#A148FF', // Purples
        '#FFCF40', '#FFBF00', '#FFD700', '#FCCF3C', // Golds
        '#39E75F', '#5CFF5C', '#9FFFCB', '#11FF98', // Greens
        '#FF4D4D', '#FF5757', '#FF7474', '#FF8A8A'  // Reds
      ];
      
      // Create confetti particles
      const createParticles = () => {
        particles = [];
        const particleCount = 300; // More particles for denser effect
        
        for (let i = 0; i < particleCount; i++) {
          // Randomize initial position (from slightly above viewport)
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height / 2 - canvas.height / 2;
          
          // Randomize particle properties
          const size = Math.random() * 10 + 6; // Larger variance in size
          const shape = ['circle', 'square', 'triangle', 'line'][Math.floor(Math.random() * 4)] as 'circle' | 'square' | 'triangle' | 'line';
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          // Improved physics parameters
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2; // Faster initial velocity
          
          particles.push({
            x,
            y,
            size,
            color,
            velocity: {
              x: Math.sin(angle) * speed,
              y: Math.cos(angle) * speed
            },
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10, // Rotation speed can be negative or positive
            shape,
            opacity: 1,
            wobble: Math.random() * 10,
            wobbleSpeed: Math.random() * 0.1,
            gravity: 0.1 + Math.random() * 0.2, // Randomized gravity for diverse falling speeds
            decay: 0.96 + Math.random() * 0.03 // Velocity decay rate (air resistance)
          });
        }
      };
      
      // Draw a single confetti particle
      const drawParticle = (p: typeof particles[0]) => {
        if (!ctx) return;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        
        // Draw based on shape
        switch (p.shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            break;
            
          case 'square':
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;
            
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            break;
            
          case 'line':
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size / 4;
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(0, p.size);
            ctx.stroke();
            break;
        }
        
        ctx.restore();
      };
      
      // Animate confetti
      const animateConfetti = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let stillActive = false;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          
          // Apply wobble effect
          p.x += Math.sin(p.wobble) * 0.5;
          p.wobble += p.wobbleSpeed;
          
          // Update position with physics
          p.velocity.x *= p.decay; // Apply air resistance
          p.velocity.y += p.gravity; // Apply gravity
          p.velocity.y *= p.decay; // Apply air resistance
          
          p.x += p.velocity.x;
          p.y += p.velocity.y;
          
          // Update rotation
          p.rotation += p.rotationSpeed;
          
          // Gradually reduce opacity based on lifetime or when particle leaves bottom of screen
          if (p.y > canvas.height * 0.8) {
            p.opacity -= 0.02;
          }
          
          // Draw the particle
          drawParticle(p);
          
          // Check if particle is still active (visible and on screen)
          if (p.opacity > 0.05 && p.y < canvas.height + p.size) {
            stillActive = true;
          }
        }
        
        // Continue animation if particles are still active
        if (stillActive) {
          confettiAnimation = requestAnimationFrame(animateConfetti);
        } else {
          // Create a new batch of particles if the effect duration hasn't expired
          // This creates multiple "waves" of confetti
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < effectDuration) {
            createParticles();
            confettiAnimation = requestAnimationFrame(animateConfetti);
          } else {
            // End confetti after duration
            setShowConfetti(false);
          }
        }
      };
      
      // Initialize and start animation
      const effectDuration = 4000; // 4 seconds of confetti
      const startTime = Date.now();
      createParticles();
      confettiAnimation = requestAnimationFrame(animateConfetti);
      
      // Clean up
      return () => {
        if (confettiAnimation) {
          cancelAnimationFrame(confettiAnimation);
        }
        window.removeEventListener('resize', setCanvasSize);
      };
    }
    
    // Cleanup
    return () => {
      if (confettiAnimation) {
        cancelAnimationFrame(confettiAnimation);
      }
    };
  }, [showConfetti]);
  
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
  
  // Place bet and flip coin
  const placeBet = async () => {
    // Reset states
    setError('');
    setResult(null);
    setHasWon(null);
    setWinAmount(0);
    
    // Validate bet amount
    if (betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    if (betAmount > balance) {
      setError('Insufficient balance');
      return;
    }
    
    try {
      // Deduct bet amount from rewards
      const success = await deductRewards(betAmount, 'Coin Flip');
      
      if (!success) {
        setError('Failed to place bet. Please try again.');
        return;
      }
      
      // Start flipping animation
      setIsFlipping(true);
      
      // Play flip sound
      if (flipSound && gameSettings.coinSound !== 'none') {
        flipSound.currentTime = 0;
        flipSound.play().catch(err => console.error('Error playing sound:', err));
      }
      
      // Simulate coin flip result after the animation duration
      setTimeout(async () => {
        // Generate random result based on configured win chance
        const winChance = gameSettings.winChance / 100;
        const userWillWin = Math.random() < winChance;
        
        // If user will win, set result to match their selection, otherwise opposite
        const flipResult = userWillWin ? selectedSide : (selectedSide === 'heads' ? 'tails' : 'heads');
        setResult(flipResult);
        
        // Check if user won
        const userWon = flipResult === selectedSide;
        setHasWon(userWon);
        
        if (userWon) {
          // Calculate winnings (2x for coin flip)
          const winnings = betAmount * 2;
          setWinAmount(winnings);
          
          // Add winnings to user's balance
          await addWinning(winnings, 'Coin Flip', 2);
          
          // Play win sound
          if (winSound) {
            setTimeout(() => {
              winSound.currentTime = 0;
              winSound.play().catch(err => console.error('Error playing sound:', err));
            }, 300);
          }
          
          // Show confetti on win
          setShowConfetti(true);
        }
        
        // Stop flipping animation
        setIsFlipping(false);
      }, gameSettings.animationDuration);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsFlipping(false);
    }
  };
  
  // Helper functions to convert Tailwind class names to CSS variables
  const getCoinBaseColor = (tailwindClass: string): string => {
    const colorMap: Record<string, string> = {
      'bg-yellow-500': '#eab308', // Gold
      'bg-yellow-400': '#facc15', // Light Gold
      'bg-gray-300': '#d1d5db',   // Silver
      'bg-gray-400': '#9ca3af',   // Light Silver
      'bg-amber-700': '#b45309',  // Bronze 
      'bg-amber-600': '#d97706',  // Light Bronze
      'bg-green-500': '#22c55e',  // Green
      'bg-green-400': '#4ade80',  // Light Green
      'bg-blue-500': '#3b82f6',   // Blue
      'bg-blue-400': '#60a5fa',   // Light Blue
      'bg-red-500': '#ef4444',    // Red
      'bg-red-400': '#f87171',    // Light Red
      'bg-purple-500': '#a855f7', // Purple
      'bg-purple-400': '#c084fc', // Light Purple
      'bg-pink-500': '#ec4899',   // Pink
      'bg-pink-400': '#f472b6',   // Light Pink
    };
    
    return colorMap[tailwindClass] || '#eab308'; // Default to gold if not found
  };
  
  const getCoinLightColor = (tailwindClass: string): string => {
    const colorMap: Record<string, string> = {
      'bg-yellow-500': '#fcd34d', // Lighter gold
      'bg-yellow-400': '#fde68a', // Lighter light gold
      'bg-gray-300': '#e5e7eb',   // Lighter silver
      'bg-gray-400': '#d1d5db',   // Lighter light silver
      'bg-amber-700': '#d97706',  // Lighter bronze
      'bg-amber-600': '#f59e0b',  // Lighter light bronze
      'bg-green-500': '#4ade80',  // Lighter green
      'bg-green-400': '#86efac',  // Lighter light green
      'bg-blue-500': '#60a5fa',   // Lighter blue
      'bg-blue-400': '#93c5fd',   // Lighter light blue
      'bg-red-500': '#f87171',    // Lighter red
      'bg-red-400': '#fca5a5',    // Lighter light red
      'bg-purple-500': '#c084fc', // Lighter purple
      'bg-purple-400': '#d8b4fe', // Lighter light purple
      'bg-pink-500': '#f472b6',   // Lighter pink
      'bg-pink-400': '#f9a8d4',   // Lighter light pink
    };
    
    return colorMap[tailwindClass] || '#fcd34d'; // Default to lighter gold if not found
  };
  
  const getCoinDarkColor = (tailwindClass: string): string => {
    const colorMap: Record<string, string> = {
      'bg-yellow-500': '#ca8a04', // Darker gold
      'bg-yellow-400': '#eab308', // Darker light gold
      'bg-gray-300': '#9ca3af',   // Darker silver
      'bg-gray-400': '#6b7280',   // Darker light silver
      'bg-amber-700': '#92400e',  // Darker bronze
      'bg-amber-600': '#b45309',  // Darker light bronze
      'bg-green-500': '#16a34a',  // Darker green
      'bg-green-400': '#22c55e',  // Darker light green
      'bg-blue-500': '#2563eb',   // Darker blue
      'bg-blue-400': '#3b82f6',   // Darker light blue
      'bg-red-500': '#dc2626',    // Darker red
      'bg-red-400': '#ef4444',    // Darker light red
      'bg-purple-500': '#9333ea', // Darker purple
      'bg-purple-400': '#a855f7', // Darker light purple
      'bg-pink-500': '#db2777',   // Darker pink
      'bg-pink-400': '#ec4899',   // Darker light pink
    };
    
    return colorMap[tailwindClass] || '#ca8a04'; // Default to darker gold if not found
  };
  
  // Helper function to get emboss level inset value
  const getEmbossLevel = (level?: string): string => {
    switch (level) {
      case 'none': return '0%';
      case 'light': return '15%';
      case 'medium': return '10%';
      case 'heavy': return '5%';
      default: return '10%'; // Medium by default
    }
  };

  // Helper function to get shine opacity
  const getShineOpacity = (level?: string): string => {
    switch (level) {
      case 'none': return '0';
      case 'light': return '0.2';
      case 'medium': return '0.4';
      case 'strong': return '0.6';
      default: return '0.2'; // Light by default
    }
  };
  
  // Helper function to get sound file path based on selected sound
  const getSoundPath = (soundType?: string): string => {
    // These would be actual sound files in a real implementation
    // For this demo, we'll assume these files exist
    switch (soundType) {
      case 'none': return '';
      case 'classic': return '/sounds/coin-flip-classic.mp3';
      case 'golden': return '/sounds/coin-flip-golden.mp3';
      case 'silver': return '/sounds/coin-flip-silver.mp3';
      case 'fantasy': return '/sounds/coin-flip-fantasy.mp3';
      default: return '/sounds/coin-flip-classic.mp3';
    }
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
        <style jsx>{`
          @keyframes flip {
            0% {
              transform: rotateY(0deg);
            }
            100% {
              transform: rotateY(1800deg);
            }
          }

          /* Add keyframes for faces during flip */
          @keyframes flipFaces {
            0%, 49.9% {
              opacity: 0;
              z-index: 0;
            }
            50%, 100% {
              opacity: 1;
              z-index: 1;
            }
          }
          
          .animate-flip {
            animation: flip 2s ease-out forwards;
            transform-style: preserve-3d;
          }
          
          .animate-flip-face-heads {
            animation: flipFaces 0.1s linear infinite;
            animation-delay: 0s;
          }
          
          .animate-flip-face-tails {
            animation: flipFaces 0.1s linear infinite;
            animation-delay: 0.05s;
          }

          @keyframes coinEntrance {
            0% {
              transform: translateY(-50px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .coin-entrance {
            animation: coinEntrance 0.5s ease-out forwards;
          }

          @keyframes winPulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          .win-pulse {
            animation: winPulse 0.5s ease-in-out 3;
          }

          /* Realistic coin styling */
          .coin {
            position: relative;
            width: 12rem;
            height: 12rem;
            border-radius: 50%;
            box-shadow: var(--coin-edge-shadow, 0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.2));
            overflow: hidden;
          }

          .coin::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.3);
            z-index: 2;
          }

          .coin::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: var(--coin-shine, radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%));
            z-index: 3;
          }

          .coin-edge {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: var(--coin-edge-border, 3px solid rgba(0, 0, 0, 0.2));
            z-index: 2;
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
            display: var(--coin-edge-display, block);
          }

          .coin-inner {
            position: absolute;
            inset: var(--coin-emboss-level, 10%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 2.5rem;
            text-align: center;
            z-index: 1;
            box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
            background: linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%);
          }

          .coin-face {
            width: 100%;
            height: 100%;
            position: absolute;
            border-radius: 50%;
            top: 0;
            left: 0;
            overflow: hidden;
          }

          .coin-heads {
            background: var(--heads-background, linear-gradient(45deg, var(--coin-color-dark) 0%, var(--coin-color) 50%, var(--coin-color-light) 100%));
            background-size: cover;
            background-position: center;
          }

          .coin-tails {
            background: var(--tails-background, linear-gradient(45deg, var(--coin-color-dark) 0%, var(--coin-color) 50%, var(--coin-color-light) 100%));
            background-size: cover;
            background-position: center;
          }

          .coin-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
          }

          .coin-ridges {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background-image: var(--coin-ridges, repeating-conic-gradient(
              rgba(0, 0, 0, 0) 0deg 5deg,
              rgba(0, 0, 0, 0.1) 5deg 10deg
            ));
            display: var(--coin-ridges-display, block);
          }

          /* Confetti canvas styling */
          .confetti-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
          }
        `}</style>
        
        <div className="mb-6">
          <Link href="/games" className="text-pink-500 hover:text-pink-400 transition flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Games
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Coin Flip</h1>
        <p className="text-gray-400 mb-8">
          Double your rewards with a 50/50 chance of winning. Simple, fast, and exciting!
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Display */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center">
              {/* Coin */}
              <div className="mb-8 relative">
                <div 
                  className={`coin ${
                    isFlipping ? 'animate-flip' : result && hasWon ? 'win-pulse' : ''
                  } ${
                    !isFlipping && !result ? 'coin-entrance' : ''
                  }`}
                  style={{ 
                    animationDuration: isFlipping ? `${gameSettings.animationDuration/1000}s` : '0.5s',
                    '--coin-color': getCoinBaseColor(result === 'heads' ? gameSettings.headsSideColor : gameSettings.tailsSideColor),
                    '--coin-color-light': getCoinLightColor(result === 'heads' ? gameSettings.headsSideColor : gameSettings.tailsSideColor),
                    '--coin-color-dark': getCoinDarkColor(result === 'heads' ? gameSettings.headsSideColor : gameSettings.tailsSideColor),
                    '--coin-edge-shadow': gameSettings.coinEdgeVisible ? '0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.2)' : 'none',
                    '--coin-edge-border': gameSettings.coinEdgeVisible ? '3px solid rgba(0, 0, 0, 0.2)' : 'none',
                    '--coin-edge-display': gameSettings.coinEdgeVisible ? 'block' : 'none',
                    '--coin-emboss-level': getEmbossLevel(gameSettings.coinEmbossLevel),
                    '--coin-ridges': gameSettings.coinRidgesVisible ? 
                      'repeating-conic-gradient(rgba(0, 0, 0, 0) 0deg 5deg, rgba(0, 0, 0, 0.1) 5deg 10deg)' : 'none',
                    '--coin-ridges-display': gameSettings.coinRidgesVisible ? 'block' : 'none',
                    '--coin-shine': gameSettings.coinShineEffect !== 'none' ? 
                      `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, ${getShineOpacity(gameSettings.coinShineEffect)}) 0%, rgba(255, 255, 255, 0) 60%)` : 'none',
                    '--heads-background': gameSettings.useCustomImages && gameSettings.headsImageUrl ? 
                      `url(${gameSettings.headsImageUrl})` : 
                      `linear-gradient(45deg, var(--coin-color-dark) 0%, var(--coin-color) 50%, var(--coin-color-light) 100%)`,
                    '--tails-background': gameSettings.useCustomImages && gameSettings.tailsImageUrl ? 
                      `url(${gameSettings.tailsImageUrl})` : 
                      `linear-gradient(45deg, var(--coin-color-dark) 0%, var(--coin-color) 50%, var(--coin-color-light) 100%)`
                  } as React.CSSProperties}
                >
                  <div className="coin-edge"></div>
                  <div className="coin-ridges"></div>
                  
                  {/* Display coin face based on game state */}
                  {/* When result is available, show the result */}
                  {result && (
                    <div className={`coin-face ${result === 'heads' ? 'coin-heads' : 'coin-tails'}`}>
                      <div className={`coin-inner ${gameSettings.textColor}`}>
                        {!gameSettings.useCustomImages || 
                        (result === 'heads' && !gameSettings.headsImageUrl) || 
                        (result === 'tails' && !gameSettings.tailsImageUrl) ? (
                          <span>
                            {result === 'heads' ? gameSettings.headsSideText : gameSettings.tailsSideText}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  {/* When flipping, show alternating faces */}
                  {isFlipping && (
                    <>
                      <div className={`coin-face coin-heads animate-flip-face-heads`} style={{
                        animationDuration: `${gameSettings.animationDuration/1000/10}s`
                      }}>
                        <div className={`coin-inner ${gameSettings.textColor}`}>
                          {!gameSettings.useCustomImages || !gameSettings.headsImageUrl ? (
                            <span>{gameSettings.headsSideText}</span>
                          ) : null}
                        </div>
                      </div>
                      <div className={`coin-face coin-tails animate-flip-face-tails`} style={{
                        animationDuration: `${gameSettings.animationDuration/1000/10}s`
                      }}>
                        <div className={`coin-inner ${gameSettings.textColor}`}>
                          {!gameSettings.useCustomImages || !gameSettings.tailsImageUrl ? (
                            <span>{gameSettings.tailsSideText}</span>
                          ) : null}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* When no result and not flipping, show the selected side */}
                  {!result && !isFlipping && (
                    <div 
                      className={`coin-face ${selectedSide === 'heads' ? 'coin-heads' : 'coin-tails'}`}
                      style={
                        (selectedSide === 'heads' && gameSettings.useCustomImages && gameSettings.headsImageUrl) || 
                        (selectedSide === 'tails' && gameSettings.useCustomImages && gameSettings.tailsImageUrl) 
                        ? {
                            backgroundImage: selectedSide === 'heads' 
                              ? `url(${gameSettings.headsImageUrl})` 
                              : `url(${gameSettings.tailsImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          } 
                        : {}
                      }
                    >
                      <div className={`coin-inner ${gameSettings.textColor}`}>
                        {!gameSettings.useCustomImages || 
                        (selectedSide === 'heads' && !gameSettings.headsImageUrl) || 
                        (selectedSide === 'tails' && !gameSettings.tailsImageUrl) ? (
                          <span>
                            {selectedSide === 'heads' ? gameSettings.headsSideText : gameSettings.tailsSideText}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Result Display */}
              {hasWon !== null && (
                <div className={`text-center mb-6 p-4 rounded-lg ${hasWon ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  <h3 className="text-2xl font-bold mb-2">
                    {hasWon ? 'You Won!' : 'You Lost!'}
                  </h3>
                  {hasWon && (
                    <p className="text-xl">
                      +{formatCurrency(winAmount)}
                    </p>
                  )}
                </div>
              )}
              
              {/* Choose Side */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center">Choose Side</h3>
                <div className="flex space-x-4">
                  <button
                    className={`w-36 h-12 rounded-md flex items-center justify-center ${
                      selectedSide === 'heads' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedSide('heads')}
                    disabled={isFlipping}
                  >
                    Heads
                  </button>
                  <button
                    className={`w-36 h-12 rounded-md flex items-center justify-center ${
                      selectedSide === 'tails' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedSide('tails')}
                    disabled={isFlipping}
                  >
                    Tails
                  </button>
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
                  disabled={isFlipping}
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
                disabled={isFlipping}
              >
                $1
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(5)}
                disabled={isFlipping}
              >
                $5
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(10)}
                disabled={isFlipping}
              >
                $10
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(25)}
                disabled={isFlipping}
              >
                $25
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={halfBet}
                disabled={isFlipping}
              >
                1/2
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={doubleBet}
                disabled={isFlipping}
              >
                2x
              </Button>
            </div>
            
            <div className="mb-6">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={maxBet}
                disabled={isFlipping}
              >
                Max Bet
              </Button>
            </div>
            
            <div className="bg-gray-700 rounded-md p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Potential Win:</span>
                <span className="font-bold">{formatCurrency(betAmount * 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Multiplier:</span>
                <span className="font-bold">2.00x</span>
              </div>
            </div>
            
            <Button 
              variant="default" 
              size="lg" 
              className="w-full" 
              onClick={placeBet}
              disabled={isFlipping || betAmount <= 0 || betAmount > balance}
              loading={isFlipping}
            >
              {isFlipping ? 'Flipping...' : 'Flip Coin'}
            </Button>
          </div>
        </div>
        
        {/* Confetti canvas */}
        {showConfetti && (
          <canvas ref={confettiCanvasRef} className="confetti-canvas" />
        )}
      </main>
      
      <Footer />
    </div>
  );
} 