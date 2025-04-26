"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

// Define symbols for the slot machine
const SYMBOLS = [
  { id: 'cherry', value: '🍒', payout: 2 },
  { id: 'lemon', value: '🍋', payout: 2 },
  { id: 'orange', value: '🍊', payout: 3 },
  { id: 'watermelon', value: '🍉', payout: 4 },
  { id: 'grape', value: '🍇', payout: 5 },
  { id: 'seven', value: '7️⃣', payout: 10 },
  { id: 'diamond', value: '💎', payout: 15 },
  { id: 'star', value: '⭐', payout: 7 },
];

// Define paylines
const PAYLINES = [
  // Horizontal lines
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  
  // Diagonal lines
  [0, 4, 8], // Top-left to bottom-right
  [6, 4, 2], // Bottom-left to top-right
];

// Define line colors for each payline
const LINE_COLORS = [
  "#FF5733", // Orange-red - Top row
  "#33FF57", // Green - Middle row
  "#3357FF", // Blue - Bottom row
  "#FF33F5", // Pink - Diagonal top-left to bottom-right
  "#F5FF33", // Yellow - Diagonal bottom-left to top-right
];

export default function SlotsPage() {
  const router = useRouter();
  
  // Ref for slot machine grid
  const gridRef = useRef<HTMLDivElement>(null);
  // Ref for confetti canvas
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // User & balance state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [formattedBalance, setFormattedBalance] = useState<string>('$0.00');
  
  // Game state
  const [betAmount, setBetAmount] = useState<number>(1);
  const [reels, setReels] = useState<Array<string>>(Array(9).fill('?'));
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [winningLines, setWinningLines] = useState<Array<number[]>>([]);
  const [lastSpinResult, setLastSpinResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showWinningLines, setShowWinningLines] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
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
  const addWinning = async (amount: number, game: string, description: string): Promise<boolean> => {
    try {
      // Create a new transaction
      const transaction = {
        id: Date.now().toString(),
        amount,
        type: 'win',
        game,
        description,
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
  
  // Spin the reels
  const spinReels = async () => {
    if (betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    if (betAmount > balance) {
      setError('Insufficient balance');
      return;
    }
    
    setError('');
    
    // Reset previous win state
    setWinAmount(0);
    setWinningLines([]);
    setShowWinningLines(false);
    setShowConfetti(false);
    setLastSpinResult('');
    
    try {
      // Deduct bet amount from balance
      const success = await deductRewards(betAmount, 'Slots Game');
      
      if (!success) {
        setError('Failed to place bet. Please try again.');
        return;
      }
      
      // Start spinning animation
      setSpinning(true);
      
      // Animate reels changing rapidly
      let spinCount = 0;
      const spinInterval = setInterval(() => {
        const randomReels = Array(9).fill(null).map(() => {
          const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
          return SYMBOLS[randomIndex].value;
        });
        setReels(randomReels);
        
        spinCount++;
        if (spinCount > 10) {
          clearInterval(spinInterval);
          
          // Generate final result
          const finalReels = generateFinalReels();
          setReels(finalReels);
          
          // Check wins
          const { winningLines, totalWin, resultDescription } = checkWins(finalReels);
          
          setWinningLines(winningLines);
          setWinAmount(totalWin);
          setLastSpinResult(resultDescription);
          
          // Add winnings if any
          if (totalWin > 0) {
            addWinning(totalWin, 'Slots Game', resultDescription);
            
            // Show winning lines with a slight delay for better effect
            setTimeout(() => {
              setShowWinningLines(true);
              setShowConfetti(true); // Show confetti for wins
            }, 300);
          }
          
          // End spinning state
          setSpinning(false);
        }
      }, 100);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSpinning(false);
    }
  };
  
  // Generate the final reel values
  const generateFinalReels = (): string[] => {
    return Array(9).fill(null).map(() => {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      return SYMBOLS[randomIndex].value;
    });
  };
  
  // Check for winning lines
  const checkWins = (reelValues: string[]): { winningLines: number[][], totalWin: number, resultDescription: string } => {
    let totalWin = 0;
    const matchingLines: number[][] = [];
    let resultDescription = 'No win';
    
    PAYLINES.forEach(line => {
      const symbols = line.map(index => reelValues[index]);
      
      // All symbols in line are the same
      if (symbols.every(s => s === symbols[0])) {
        matchingLines.push(line);
        
        // Find the symbol and its payout
        const symbol = SYMBOLS.find(s => s.value === symbols[0]);
        if (symbol) {
          const lineWin = betAmount * symbol.payout;
          totalWin += lineWin;
          
          if (resultDescription === 'No win') {
            resultDescription = '';
          } else {
            resultDescription += ' + ';
          }
          
          resultDescription += `${symbol.value} line (${formatCurrency(lineWin)})`;
        }
      }
    });
    
    if (totalWin === 0) {
      return { winningLines: [], totalWin: 0, resultDescription: 'No win' };
    }
    
    resultDescription = `Won ${formatCurrency(totalWin)} with ${resultDescription}`;
    return { winningLines, totalWin, resultDescription };
  };
  
  // Get cell background based on winning lines
  const getCellBackground = (index: number): string => {
    for (const line of winningLines) {
      if (line.includes(index)) {
        return 'bg-green-500/30 border-green-500';
      }
    }
    return 'bg-gray-700 border-gray-600';
  };
  
  // Get cell DOM element by index
  const getCellElement = (index: number): HTMLElement | null => {
    if (!gridRef.current) return null;
    const cells = gridRef.current.querySelectorAll('.slot-cell');
    return cells[index] as HTMLElement;
  };
  
  // Get center coordinates of a cell relative to the grid
  const getCellCenter = (cellElement: HTMLElement): { x: number, y: number } => {
    if (!gridRef.current || !cellElement) return { x: 0, y: 0 };
    
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellRect = cellElement.getBoundingClientRect();
    
    // Calculate center point relative to the grid
    const x = (cellRect.left - gridRect.left) + (cellRect.width / 2);
    const y = (cellRect.top - gridRect.top) + (cellRect.height / 2);
    
    return { x, y };
  };
  
  // Initialize confetti effect
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
  
  // Draw lines for winning paylines - debugging with position logging
  const renderWinningLines = () => {
    if (!showWinningLines || winningLines.length === 0 || !gridRef.current) {
      console.log("Not rendering lines: showWinningLines=", showWinningLines, "winningLines.length=", winningLines.length);
      return null;
    }
    
    console.log("Rendering winning lines:", winningLines);
    
    const gridRect = gridRef.current?.getBoundingClientRect();
    console.log("Grid dimensions:", gridRect.width, "x", gridRect.height);
    
    const strokeWidth = Math.max(3, gridRect.width * 0.02); // Thicker lines for better visibility
    
    // Create lines for each winning payline
    return (
      <svg className="absolute inset-0 pointer-events-none z-20 w-full h-full overflow-visible">
        {winningLines.map((line, lineIndex) => {
          // For more reliable positioning, calculate positions based on the grid
          const rowSize = gridRect.height / 3;
          const colSize = gridRect.width / 3;
          
          // Calculate center points directly
          const points = line.map(index => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            return {
              x: (col * colSize) + (colSize / 2),
              y: (row * rowSize) + (rowSize / 2)
            };
          });
          
          console.log(`Line ${lineIndex} points:`, points);
          
          // Calculate the total length of the line for the dash animation
          let totalLength = 0;
          for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x;
            const dy = points[i].y - points[i-1].y;
            totalLength += Math.sqrt(dx*dx + dy*dy);
          }
          
          return (
            <g key={lineIndex}>
              {/* Main line with drawing animation */}
              <polyline
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={LINE_COLORS[lineIndex % LINE_COLORS.length]}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.9"
                strokeDasharray={totalLength}
                strokeDashoffset="0"
                style={{
                  animation: `drawLine 0.5s ease-in-out forwards, pulseOpacity 1.5s infinite ease-in-out 0.5s`
                }}
              />
              
              {/* Glow effect for the line */}
              <polyline
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={LINE_COLORS[lineIndex % LINE_COLORS.length]}
                strokeWidth={strokeWidth * 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.3"
                style={{
                  filter: "blur(3px)",
                  animation: "pulseOpacity 1.5s infinite ease-in-out alternate"
                }}
              />
              
              {/* Add circles at each point for better visibility */}
              {points.map((point, pointIndex) => (
                <circle
                  key={pointIndex}
                  cx={point.x}
                  cy={point.y}
                  r={strokeWidth * 1.5}
                  fill={LINE_COLORS[lineIndex % LINE_COLORS.length]}
                  style={{
                    animation: `pulseScale 1.5s infinite ease-in-out ${pointIndex * 0.2}s`,
                    filter: "drop-shadow(0 0 3px rgba(255,255,255,0.7))"
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>
    );
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
      
      {/* Confetti Canvas (full screen) */}
      {showConfetti && (
        <canvas
          ref={confettiCanvasRef}
          className="fixed inset-0 pointer-events-none z-50 w-full h-full"
        />
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/games" className="text-pink-500 hover:text-pink-400 transition flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Games
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Slots Game</h1>
        <p className="text-gray-400 mb-8">
          Spin the reels and match symbols to win! Multiple paylines available.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Display */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="max-w-md mx-auto">
              {/* Slot Machine Display */}
              <div ref={gridRef} className="grid grid-cols-3 gap-2 mb-6 relative">
                {reels.map((symbol, index) => (
                  <div 
                    key={index} 
                    className={`slot-cell aspect-square flex items-center justify-center text-4xl border-2 rounded-md transition-all ${getCellBackground(index)}`}
                  >
                    {symbol}
                  </div>
                ))}
                {renderWinningLines()}
              </div>
              
              {/* Win Display */}
              {winAmount > 0 && (
                <div className="text-center mb-6 p-4 rounded-lg bg-green-500/20 text-green-500">
                  <h3 className="text-2xl font-bold mb-2">
                    You Won!
                  </h3>
                  <p className="text-xl">
                    +{formatCurrency(winAmount)}
                  </p>
                  <p className="text-sm mt-2">
                    {lastSpinResult}
                  </p>
                </div>
              )}
              
              {/* Spin Button */}
              <Button 
                variant="default" 
                size="lg" 
                className="w-full h-16 text-xl" 
                onClick={spinReels}
                disabled={spinning || betAmount <= 0 || betAmount > balance}
              >
                {spinning ? 'Spinning...' : 'Spin'}
              </Button>
              
              {/* Paylines Info */}
              <div className="mt-8">
                <h3 className="text-center text-lg font-semibold mb-4">Symbol Payouts (per $1 bet)</h3>
                <div className="grid grid-cols-4 gap-4">
                  {SYMBOLS.map(symbol => (
                    <div key={symbol.id} className="flex flex-col items-center bg-gray-700 p-3 rounded-md">
                      <span className="text-2xl mb-1">{symbol.value}</span>
                      <span className="text-sm text-gray-300">{symbol.payout}x</span>
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
                  disabled={spinning}
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
                disabled={spinning}
              >
                $1
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(5)}
                disabled={spinning}
              >
                $5
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(10)}
                disabled={spinning}
              >
                $10
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => quickBet(25)}
                disabled={spinning}
              >
                $25
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={halfBet}
                disabled={spinning}
              >
                1/2
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={doubleBet}
                disabled={spinning}
              >
                2x
              </Button>
            </div>
            
            <div className="mb-6">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={maxBet}
                disabled={spinning}
              >
                Max Bet
              </Button>
            </div>
            
            <div className="bg-gray-700 rounded-md p-4 mb-6">
              <h3 className="font-medium mb-2">Paylines</h3>
              <p className="text-sm text-gray-400 mb-2">
                Win by matching 3 identical symbols on any of these lines:
              </p>
              <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                <li>Top row</li>
                <li>Middle row</li>
                <li>Bottom row</li>
                <li>Diagonal (top-left to bottom-right)</li>
                <li>Diagonal (bottom-left to top-right)</li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-400 p-4 bg-gray-700/50 rounded-md">
              <h3 className="font-medium text-white mb-2">How to Play</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter your bet amount</li>
                <li>Click &quot;Spin&quot; to begin</li>
                <li>Match 3 identical symbols in a row to win</li>
                <li>Different symbols have different payouts</li>
                <li>Win on multiple lines for bigger prizes!</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 