"use client";

import React, { createContext, useEffect, useState } from "react";
import { formatCurrency } from "../utils";

interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'win' | 'loss';
  game?: string;
  description: string;
  timestamp: Date;
}

interface RewardContextType {
  balance: number;
  formattedBalance: string;
  transactions: Transaction[];
  loading: boolean;
  addRewards: (amount: number, source: string) => Promise<boolean>;
  deductRewards: (amount: number, game: string) => Promise<boolean>;
  addWinning: (amount: number, game: string, multiplier: number) => Promise<boolean>;
}

const RewardContext = createContext<RewardContextType>({
  balance: 0,
  formattedBalance: '$0.00',
  transactions: [],
  loading: true,
  addRewards: async () => false,
  deductRewards: async () => false,
  addWinning: async () => false,
});

export function RewardProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedBalance = localStorage.getItem('balance');
    const storedTransactions = localStorage.getItem('transactions');
    
    if (storedBalance) {
      setBalance(parseFloat(storedBalance));
    }
    
    if (storedTransactions) {
      // Parse the transactions and convert timestamp strings back to Date objects
      const parsedTransactions = JSON.parse(storedTransactions);
      setTransactions(parsedTransactions.map((t: any) => ({
        ...t, 
        timestamp: new Date(t.timestamp)
      })));
    }
    
    setLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('balance', balance.toString());
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [balance, transactions, loading]);

  // Add rewards to user's balance
  const addRewards = async (amount: number, source: string): Promise<boolean> => {
    try {
      // Create a new transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        amount,
        type: 'deposit',
        description: `Rewards from ${source}`,
        timestamp: new Date(),
      };
      
      // Update state
      setBalance(prevBalance => prevBalance + amount);
      setTransactions(prevTransactions => [...prevTransactions, transaction]);
      
      return true;
    } catch (error) {
      console.error("Error adding rewards:", error);
      return false;
    }
  };

  // Deduct rewards for placing a bet
  const deductRewards = async (amount: number, game: string): Promise<boolean> => {
    try {
      // Check if user has enough balance
      if (balance < amount) return false;
      
      // Create a new transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        amount: -amount,
        type: 'loss',
        game,
        description: `Bet placed on ${game}`,
        timestamp: new Date(),
      };
      
      // Update state
      setBalance(prevBalance => prevBalance - amount);
      setTransactions(prevTransactions => [...prevTransactions, transaction]);
      
      return true;
    } catch (error) {
      console.error("Error deducting rewards:", error);
      return false;
    }
  };

  // Add winning rewards
  const addWinning = async (amount: number, game: string, multiplier: number): Promise<boolean> => {
    try {
      // Create a new transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        amount,
        type: 'win',
        game,
        description: `Won ${formatCurrency(amount)} on ${game} (${multiplier}x)`,
        timestamp: new Date(),
      };
      
      // Update state
      setBalance(prevBalance => prevBalance + amount);
      setTransactions(prevTransactions => [...prevTransactions, transaction]);
      
      return true;
    } catch (error) {
      console.error("Error adding winning:", error);
      return false;
    }
  };

  // Format balance as currency
  const formattedBalance = formatCurrency(balance);

  return (
    <RewardContext.Provider 
      value={{ 
        balance, 
        formattedBalance, 
        transactions, 
        loading, 
        addRewards, 
        deductRewards, 
        addWinning 
      }}
    >
      {children}
    </RewardContext.Provider>
  );
}

export { RewardContext }; 