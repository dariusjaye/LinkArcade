"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

const CrackTheCode: React.FC = () => {
  const router = useRouter();
  
  // User data and authentication
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [formattedBalance, setFormattedBalance] = useState<string>('$0.00');
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>(["", "", "", ""]);
  const [guessHistory, setGuessHistory] = useState<Array<{
    guess: string[];
    correctPosition: number;
    correctDigits: number;
  }>>([]);
  const [remainingGuesses, setRemainingGuesses] = useState(10);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [error, setError] = useState('');
  const [winAmount, setWinAmount] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Confetti canvas reference
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game settings
  const difficultySettings = {
    easy: { maxGuesses: 12, multiplier: 2 },
    medium: { maxGuesses: 10, multiplier: 3 },
    hard: { maxGuesses: 8, multiplier: 5 }
  };

  // Load user data from localStorage
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

  // Update remaining guesses when difficulty changes
  useEffect(() => {
    setRemainingGuesses(difficultySettings[difficulty].maxGuesses);
  }, [difficulty]);

  // Generate a random 4-digit code
  const generateSecretCode = () => {
    const newCode = [];
    for (let i = 0; i < 4; i++) {
      newCode.push(Math.floor(Math.random() * 10).toString());
    }
    return newCode;
  };

  // Handle win
  const handleWin = async () => {
    setGameResult('won');
    
    // Calculate winnings based on difficulty and remaining guesses
    const baseMultiplier = difficultySettings[difficulty].multiplier;
    const bonusMultiplier = remainingGuesses * 0.2; // Bonus for each remaining guess
    const totalMultiplier = baseMultiplier + bonusMultiplier;
    
    const winnings = Math.round(betAmount * totalMultiplier * 100) / 100;
    setWinAmount(winnings);
    
    // Add winnings to balance
    await addWinning(winnings, 'Crack the Code', totalMultiplier);
    
    // Show confetti
    setShowConfetti(true);
  };

  // Handle loss
  const handleLoss = () => {
    setGameResult('lost');
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
        description: `Won ${formatCurrency(amount)} on ${game} (${multiplier.toFixed(1)}x)`,
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
      const effectDuration = 5000; // 5 seconds of confetti
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

  // Start a new game
  const startGame = async () => {
    // Reset states
    setError('');
    setGameResult(null);
    setWinAmount(0);
    setGuessHistory([]);
    
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
      const success = await deductRewards(betAmount, 'Crack the Code');
      
      if (!success) {
        setError('Failed to place bet. Please try again.');
        return;
      }
      
      // Generate new secret code
      const newCode = generateSecretCode();
      setSecretCode(newCode);
      setCurrentGuess(["", "", "", ""]);
      setRemainingGuesses(difficultySettings[difficulty].maxGuesses);
      setIsPlaying(true);
      
      console.log('Secret code for debugging:', newCode.join('')); // For testing only
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Handle digit input
  const handleDigitChange = (index: number, value: string) => {
    if (isPlaying && !gameResult) {
      // Ensure input is a single digit
      const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
      
      // Update the current guess
      const newGuess = [...currentGuess];
      newGuess[index] = digit;
      setCurrentGuess(newGuess);
      
      // Auto-focus next input if this one is filled
      if (digit && index < 3) {
        const nextInput = document.getElementById(`digit-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle key press for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !currentGuess[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Check the current guess
  const checkGuess = () => {
    if (currentGuess.some(digit => digit === "")) {
      setError('Please enter all 4 digits');
      return;
    }
    
    setError('');
    
    // Count correct positions and correct digits
    let correctPosition = 0;
    let correctDigits = 0;
    const codeCopy = [...secretCode];
    const guessCopy = [...currentGuess];
    
    // First check for correct positions
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === codeCopy[i]) {
        correctPosition++;
        // Mark as processed
        codeCopy[i] = 'x';
        guessCopy[i] = 'y';
      }
    }
    
    // Then check for correct digits in wrong positions
    for (let i = 0; i < 4; i++) {
      const index = codeCopy.indexOf(guessCopy[i]);
      if (guessCopy[i] !== 'y' && index !== -1) {
        correctDigits++;
        // Mark as processed
        codeCopy[index] = 'x';
      }
    }
    
    // Add to history
    const newGuessEntry = {
      guess: [...currentGuess],
      correctPosition,
      correctDigits
    };
    
    setGuessHistory([...guessHistory, newGuessEntry]);
    setCurrentGuess(["", "", "", ""]);
    setRemainingGuesses(remainingGuesses - 1);
    
    // Check if won
    if (correctPosition === 4) {
      handleWin();
    } else if (remainingGuesses <= 1) {
      // Game over if no more guesses
      handleLoss();
    }
    
    // Focus first digit input for next guess
    const firstInput = document.getElementById('digit-0');
    if (firstInput) firstInput.focus();
  };

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
          .code-digit {
            width: 3rem;
            height: 3.5rem;
            font-size: 1.5rem;
            background: rgba(30, 41, 59, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            text-align: center;
            color: white;
            outline: none;
          }
          
          .code-digit:focus {
            border-color: rgba(236, 72, 153, 0.5);
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.25);
          }
          
          .history-item {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .result-digit {
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            font-weight: bold;
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
        
        <h1 className="text-3xl font-bold mb-2">Crack the Code</h1>
        <p className="text-gray-400 mb-8">
          Guess the 4-digit code by using logical deduction. Get feedback after each guess to solve the puzzle!
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            {!isPlaying && !gameResult && (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">How to Play</h2>
                <p className="text-gray-300 mb-6">
                  Try to guess the secret 4-digit code. After each guess, you'll get feedback on:
                </p>
                <ul className="space-y-3 text-left max-w-md mx-auto mb-8">
                  <li className="flex items-center">
                    <span className="flex-shrink-0 rounded-full bg-green-500 p-1 mr-3"></span>
                    <span>Correct digits in the correct position</span>
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 rounded-full bg-yellow-500 p-1 mr-3"></span>
                    <span>Correct digits in the wrong position</span>
                  </li>
                </ul>
                <p className="text-gray-300 mb-4">
                  Use this feedback to solve the code in {difficultySettings[difficulty].maxGuesses} attempts or less.
                </p>
                <div className="mt-8">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="px-8" 
                    onClick={startGame}
                    disabled={betAmount <= 0 || betAmount > balance}
                  >
                    Place Bet & Start Game
                  </Button>
                </div>
              </div>
            )}

            {isPlaying && (
              <div>
                {/* Game header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Guess the Code</h2>
                  <div className="bg-gray-700 px-3 py-1 rounded-md text-sm">
                    Guesses Left: <span className="font-bold">{remainingGuesses}</span>
                  </div>
                </div>

                {/* Current guess input */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-2">Enter your guess:</label>
                  <div className="flex justify-center space-x-2 mb-4">
                    {currentGuess.map((digit, index) => (
                      <input
                        key={index}
                        id={`digit-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="code-digit"
                        disabled={!!gameResult}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <Button 
                      onClick={checkGuess}
                      disabled={currentGuess.some(d => d === "") || !!gameResult}
                    >
                      Submit Guess
                    </Button>
                  </div>
                </div>

                {/* Guess history */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Previous Guesses</h3>
                  {guessHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Your guess history will appear here</p>
                  ) : (
                    <div className="space-y-3">
                      {guessHistory.map((entry, index) => (
                        <div key={index} className="history-item bg-gray-700/50 p-3 rounded-md flex justify-between items-center">
                          <div className="flex space-x-2">
                            {entry.guess.map((digit, digitIndex) => (
                              <div key={digitIndex} className="result-digit bg-gray-600">
                                {digit}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span>{entry.correctPosition}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                              <span>{entry.correctDigits}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Game result */}
                {gameResult && (
                  <div className={`mt-8 text-center p-6 rounded-lg ${gameResult === 'won' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <h3 className="text-2xl font-bold mb-3">
                      {gameResult === 'won' ? 'Congratulations!' : 'Game Over'}
                    </h3>
                    <p className="text-xl mb-3">
                      {gameResult === 'won' 
                        ? `You cracked the code and won ${formatCurrency(winAmount)}!` 
                        : `The code was ${secretCode.join('')}`}
                    </p>
                    <Button 
                      variant="default" 
                      onClick={() => {
                        setIsPlaying(false);
                        setGameResult(null);
                      }}
                      className="mt-3"
                    >
                      Play Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Controls Area */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Game Settings</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`p-2 rounded-md text-center text-sm ${
                    difficulty === 'easy' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setDifficulty('easy')}
                  disabled={isPlaying}
                >
                  Easy
                  <div className="text-xs mt-1 opacity-80">2x</div>
                </button>
                <button
                  className={`p-2 rounded-md text-center text-sm ${
                    difficulty === 'medium' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setDifficulty('medium')}
                  disabled={isPlaying}
                >
                  Medium
                  <div className="text-xs mt-1 opacity-80">3x</div>
                </button>
                <button
                  className={`p-2 rounded-md text-center text-sm ${
                    difficulty === 'hard' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setDifficulty('hard')}
                  disabled={isPlaying}
                >
                  Hard
                  <div className="text-xs mt-1 opacity-80">5x</div>
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {difficulty === 'easy' 
                  ? '12 guesses - Easier to solve but lower multiplier' 
                  : difficulty === 'medium' 
                    ? '10 guesses - Balanced difficulty and reward' 
                    : '8 guesses - More challenging with higher reward'}
              </div>
            </div>
            
            {/* Bet Amount */}
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
            
            {/* Quick Bet Buttons */}
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
            
            {/* Max Bet Button */}
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
            
            {/* Potential Win Display */}
            <div className="bg-gray-700 rounded-md p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Potential Win:</span>
                <span className="font-bold">
                  {formatCurrency(betAmount * difficultySettings[difficulty].multiplier)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Base Multiplier:</span>
                <span className="font-bold">{difficultySettings[difficulty].multiplier}x</span>
              </div>
              <div className="text-gray-400 text-xs mt-2">
                Bonus: +0.2x per remaining guess
              </div>
            </div>
            
            {/* Play Button */}
            {!isPlaying && (
              <Button 
                variant="default" 
                size="lg" 
                className="w-full" 
                onClick={startGame}
                disabled={betAmount <= 0 || betAmount > balance}
              >
                Place Bet & Play
              </Button>
            )}
            
            {/* Restart Button */}
            {isPlaying && (
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                  if (confirm("Are you sure you want to forfeit this game? Your bet will be lost.")) {
                    setIsPlaying(false);
                    setGameResult('lost');
                  }
                }}
              >
                Forfeit Game
              </Button>
            )}
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

export default CrackTheCode; 