"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  subscribeToCollection,
  subscribeToDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  incrementField,
  getDocumentById,
} from "../firebase/firebaseUtils";
import { useAuth } from "../hooks/useAuth";

// Define types for our data models
export interface Game {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  minBet?: number;
  maxBet?: number;
  isActive: boolean;
  updatedAt: any;
  createdAt: any;
}

export interface GamePlay {
  id: string;
  gameId: string;
  userId: string;
  bet: number;
  outcome: "win" | "loss";
  winAmount: number;
  createdAt: any;
}

export interface UserStats {
  id: string;
  userId: string;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalBetAmount: number;
  totalWinAmount: number;
  updatedAt: any;
}

export interface Leaderboard {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  points: number;
  rank: number;
  updatedAt: any;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  isAvailable: boolean;
  stock?: number;
  updatedAt: any;
  createdAt: any;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  redeemed: boolean;
  redeemedAt: any;
  createdAt: any;
}

// Define the context value type
interface DataContextType {
  // Games
  games: Game[];
  loadingGames: boolean;
  getGame: (id: string) => Promise<Game | null>;
  
  // Game plays
  userGamePlays: GamePlay[];
  loadingUserGamePlays: boolean;
  addGamePlay: (gamePlay: Omit<GamePlay, "id" | "userId" | "createdAt">) => Promise<string>;
  
  // User stats
  userStats: UserStats | null;
  loadingUserStats: boolean;
  
  // Leaderboard
  leaderboard: Leaderboard[];
  loadingLeaderboard: boolean;

  // Rewards
  rewards: Reward[];
  loadingRewards: boolean;
  redeemReward: (rewardId: string) => Promise<string>;
  userRewards: UserReward[];
  loadingUserRewards: boolean;
  
  // User points
  addPoints: (points: number) => Promise<string>;
}

// Create the context with default values
const DataContext = createContext<DataContextType>({
  // Games
  games: [],
  loadingGames: true,
  getGame: async () => null,
  
  // Game plays
  userGamePlays: [],
  loadingUserGamePlays: true,
  addGamePlay: async () => "",
  
  // User stats
  userStats: null,
  loadingUserStats: true,
  
  // Leaderboard
  leaderboard: [],
  loadingLeaderboard: true,

  // Rewards
  rewards: [],
  loadingRewards: true,
  redeemReward: async () => "",
  userRewards: [],
  loadingUserRewards: true,
  
  // User points
  addPoints: async () => "",
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();
  
  // Games state
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  
  // Game plays state
  const [userGamePlays, setUserGamePlays] = useState<GamePlay[]>([]);
  const [loadingUserGamePlays, setLoadingUserGamePlays] = useState(true);
  
  // User stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingUserStats, setLoadingUserStats] = useState(true);
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  
  // Rewards state
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  
  // User rewards state
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [loadingUserRewards, setLoadingUserRewards] = useState(true);

  // Fetch games
  useEffect(() => {
    setLoadingGames(true);
    
    const unsubscribe = subscribeToCollection<Game>(
      "games",
      (data) => {
        setGames(data);
        setLoadingGames(false);
      },
      {
        orderByField: "name",
        orderDirection: "asc",
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Fetch user game plays
  useEffect(() => {
    if (!user) {
      setUserGamePlays([]);
      setLoadingUserGamePlays(false);
      return;
    }
    
    setLoadingUserGamePlays(true);
    
    const unsubscribe = subscribeToCollection<GamePlay>(
      "gamePlays",
      (data) => {
        setUserGamePlays(data);
        setLoadingUserGamePlays(false);
      },
      {
        whereField: "userId",
        whereOperation: "==",
        whereValue: user.uid,
        orderByField: "createdAt",
        orderDirection: "desc",
        limitTo: 50,
      }
    );
    
    return () => unsubscribe();
  }, [user]);

  // Fetch or create user stats
  useEffect(() => {
    if (!user) {
      setUserStats(null);
      setLoadingUserStats(false);
      return;
    }
    
    setLoadingUserStats(true);
    
    const unsubscribe = subscribeToDocument<UserStats>(
      "userStats",
      user.uid,
      async (data) => {
        if (data) {
          setUserStats(data);
        } else {
          // Create new user stats if none exist
          const initialStats: Omit<UserStats, "id" | "updatedAt"> = {
            userId: user.uid,
            totalGamesPlayed: 0,
            totalWins: 0,
            totalLosses: 0,
            totalBetAmount: 0,
            totalWinAmount: 0,
          };
          
          await addDocument("userStats", initialStats);
          // The stats will be populated by the subscription
        }
        
        setLoadingUserStats(false);
      }
    );
    
    return () => unsubscribe();
  }, [user]);

  // Fetch leaderboard
  useEffect(() => {
    setLoadingLeaderboard(true);
    
    const unsubscribe = subscribeToCollection<Leaderboard>(
      "leaderboard",
      (data) => {
        // Sort by points and assign ranks
        const sortedData = [...data].sort((a, b) => b.points - a.points);
        const dataWithRanks = sortedData.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
        
        setLeaderboard(dataWithRanks);
        setLoadingLeaderboard(false);
      },
      {
        orderByField: "points",
        orderDirection: "desc",
        limitTo: 100,
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Fetch rewards
  useEffect(() => {
    setLoadingRewards(true);
    
    const unsubscribe = subscribeToCollection<Reward>(
      "rewards",
      (data) => {
        setRewards(data);
        setLoadingRewards(false);
      },
      {
        whereField: "isAvailable",
        whereOperation: "==",
        whereValue: true,
        orderByField: "pointsCost",
        orderDirection: "asc",
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Fetch user rewards
  useEffect(() => {
    if (!user) {
      setUserRewards([]);
      setLoadingUserRewards(false);
      return;
    }
    
    setLoadingUserRewards(true);
    
    const unsubscribe = subscribeToCollection<UserReward>(
      "userRewards",
      (data) => {
        setUserRewards(data);
        setLoadingUserRewards(false);
      },
      {
        whereField: "userId",
        whereOperation: "==",
        whereValue: user.uid,
        orderByField: "createdAt",
        orderDirection: "desc",
      }
    );
    
    return () => unsubscribe();
  }, [user]);

  // Get a single game by ID
  const getGame = async (id: string): Promise<Game | null> => {
    return getDocumentById<Game>("games", id);
  };

  // Add a new game play
  const addGamePlay = async (gamePlay: Omit<GamePlay, "id" | "userId" | "createdAt">): Promise<string> => {
    if (!user) throw new Error("User must be authenticated to play games");
    
    const newGamePlay = {
      ...gamePlay,
      userId: user.uid,
    };
    
    const gamePlayId = await addDocument("gamePlays", newGamePlay);
    
    // Update user stats
    if (userStats) {
      const statsUpdates: Record<string, any> = {
        totalGamesPlayed: userStats.totalGamesPlayed + 1,
        totalBetAmount: userStats.totalBetAmount + gamePlay.bet,
      };
      
      if (gamePlay.outcome === "win") {
        statsUpdates.totalWins = userStats.totalWins + 1;
        statsUpdates.totalWinAmount = userStats.totalWinAmount + gamePlay.winAmount;
        
        // Add points for winning
        await addPoints(Math.floor(gamePlay.winAmount / 10));
      } else {
        statsUpdates.totalLosses = userStats.totalLosses + 1;
      }
      
      await updateDocument("userStats", user.uid, statsUpdates);
    }
    
    return gamePlayId;
  };

  // Add points to user
  const addPoints = async (points: number): Promise<string> => {
    if (!user) throw new Error("User must be authenticated to add points");
    
    // Update user profile points
    await incrementField("users", user.uid, "points", points);
    
    // Update or create leaderboard entry
    const leaderboardEntry = leaderboard.find(entry => entry.userId === user.uid);
    
    if (leaderboardEntry) {
      await incrementField("leaderboard", leaderboardEntry.id, "points", points);
    } else if (userProfile) {
      const newLeaderboardEntry = {
        userId: user.uid,
        displayName: userProfile.displayName || "Anonymous",
        photoURL: userProfile.photoURL || "",
        points: points,
      };
      
      await addDocument("leaderboard", newLeaderboardEntry);
    }
    
    return user.uid;
  };

  // Redeem a reward
  const redeemReward = async (rewardId: string): Promise<string> => {
    if (!user || !userProfile) throw new Error("User must be authenticated to redeem rewards");
    
    // Find the reward
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error("Reward not found");
    
    // Check if user has enough points
    if (userProfile.points < reward.pointsCost) {
      throw new Error("Not enough points to redeem this reward");
    }
    
    // Check if reward is in stock
    if (reward.stock !== undefined && reward.stock <= 0) {
      throw new Error("This reward is out of stock");
    }
    
    // Deduct points from user
    await incrementField("users", user.uid, "points", -reward.pointsCost);
    
    // Update leaderboard
    const leaderboardEntry = leaderboard.find(entry => entry.userId === user.uid);
    if (leaderboardEntry) {
      await incrementField("leaderboard", leaderboardEntry.id, "points", -reward.pointsCost);
    }
    
    // Create user reward record
    const userReward = {
      userId: user.uid,
      rewardId,
      redeemed: false,
    };
    
    const userRewardId = await addDocument("userRewards", userReward);
    
    // Update reward stock if applicable
    if (reward.stock !== undefined) {
      await incrementField("rewards", rewardId, "stock", -1);
    }
    
    return userRewardId;
  };

  return (
    <DataContext.Provider
      value={{
        // Games
        games,
        loadingGames,
        getGame,
        
        // Game plays
        userGamePlays,
        loadingUserGamePlays,
        addGamePlay,
        
        // User stats
        userStats,
        loadingUserStats,
        
        // Leaderboard
        leaderboard,
        loadingLeaderboard,
        
        // Rewards
        rewards,
        loadingRewards,
        redeemReward,
        userRewards,
        loadingUserRewards,
        
        // User points
        addPoints,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
} 