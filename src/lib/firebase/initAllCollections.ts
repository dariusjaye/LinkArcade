"use client";

import firebase, { db } from "./firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp, Firestore } from "firebase/firestore";

// Helper function to get safe Firestore instance
const getFirestoreInstance = (): Firestore => {
  if (!firebase.safeDb) {
    throw new Error("Firebase Firestore is not initialized");
  }
  return firebase.db; // This will use the non-null getter
};

/**
 * Initialize all Firestore collections with sample data
 * This function creates all required collections: users, games, gamePlays, userStats, leaderboard, rewards, userRewards
 */
export const initializeAllCollections = async () => {
  console.log("Initializing all Firestore collections with sample data...");
  
  try {
    // Get a non-null Firestore instance
    const firestoreDb = getFirestoreInstance();
    
    // Initialize users collection
    const usersSnapshot = await getDocs(collection(firestoreDb, "users"));
    if (usersSnapshot.empty) {
      // Add sample users
      const users = [
        {
          email: "user1@example.com",
          displayName: "Test User",
          photoURL: "https://placehold.co/200?text=User1",
          points: 500,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          email: "user2@example.com",
          displayName: "Demo Player",
          photoURL: "https://placehold.co/200?text=User2",
          points: 1200,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          email: "user3@example.com",
          displayName: "Pro Gamer",
          photoURL: "https://placehold.co/200?text=User3",
          points: 3500,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < users.length; i++) {
        await setDoc(doc(firestoreDb, "users", `user-${i+1}`), users[i]);
        console.log(`Added user: ${users[i].displayName}`);
      }
    }
    
    // Initialize games collection
    const gamesSnapshot = await getDocs(collection(firestoreDb, "games"));
    if (gamesSnapshot.empty) {
      // Add sample games
      const games = [
        {
          name: "Coin Flip",
          description: "A simple game of chance. Flip a coin and double your bet on heads, lose it all on tails!",
          imageUrl: "https://placehold.co/400x200?text=Coin+Flip",
          minBet: 10,
          maxBet: 1000,
          isActive: true,
          popular: true,
          multiplier: "2x",
          implemented: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "Dice Roll",
          description: "Roll the dice and win big! Get a 6 to win 5x your bet.",
          imageUrl: "https://placehold.co/400x200?text=Dice+Roll",
          minBet: 20,
          maxBet: 500,
          isActive: true,
          popular: true,
          multiplier: "5x",
          implemented: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "Roulette",
          description: "Place your bets on red, black, or a specific number. The wheel decides your fate!",
          imageUrl: "https://placehold.co/400x200?text=Roulette",
          minBet: 50,
          maxBet: 2000,
          isActive: true,
          popular: false,
          multiplier: "36x",
          implemented: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < games.length; i++) {
        await setDoc(doc(firestoreDb, "games", `game-${i+1}`), games[i]);
        console.log(`Added game: ${games[i].name}`);
      }
    }
    
    // Initialize gamePlays collection
    const gamePlaysSnapshot = await getDocs(collection(firestoreDb, "gamePlays"));
    if (gamePlaysSnapshot.empty) {
      // Add sample game plays
      const gamePlays = [
        {
          gameId: "game-1",
          userId: "user-1",
          bet: 50,
          outcome: "win",
          winAmount: 100,
          createdAt: serverTimestamp()
        },
        {
          gameId: "game-2",
          userId: "user-1",
          bet: 100,
          outcome: "loss",
          winAmount: 0,
          createdAt: serverTimestamp()
        },
        {
          gameId: "game-1",
          userId: "user-2",
          bet: 200,
          outcome: "win",
          winAmount: 400,
          createdAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < gamePlays.length; i++) {
        await setDoc(doc(firestoreDb, "gamePlays", `gamePlay-${i+1}`), gamePlays[i]);
        console.log(`Added game play for user ${gamePlays[i].userId} on game ${gamePlays[i].gameId}`);
      }
    }
    
    // Initialize userStats collection
    const userStatsSnapshot = await getDocs(collection(firestoreDb, "userStats"));
    if (userStatsSnapshot.empty) {
      // Add sample user stats
      const userStats = [
        {
          userId: "user-1",
          totalGamesPlayed: 15,
          totalWins: 8,
          totalLosses: 7,
          totalBetAmount: 750,
          totalWinAmount: 1200,
          updatedAt: serverTimestamp()
        },
        {
          userId: "user-2",
          totalGamesPlayed: 22,
          totalWins: 10,
          totalLosses: 12,
          totalBetAmount: 1100,
          totalWinAmount: 1800,
          updatedAt: serverTimestamp()
        },
        {
          userId: "user-3",
          totalGamesPlayed: 45,
          totalWins: 25,
          totalLosses: 20,
          totalBetAmount: 2250,
          totalWinAmount: 4500,
          updatedAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < userStats.length; i++) {
        await setDoc(doc(firestoreDb, "userStats", userStats[i].userId), userStats[i]);
        console.log(`Added stats for user: ${userStats[i].userId}`);
      }
    }
    
    // Initialize leaderboard collection
    const leaderboardSnapshot = await getDocs(collection(firestoreDb, "leaderboard"));
    if (leaderboardSnapshot.empty) {
      const leaderboard = [
        {
          userId: "user-3",
          displayName: "Pro Gamer",
          photoURL: "https://placehold.co/200?text=User3",
          points: 3500,
          updatedAt: serverTimestamp()
        },
        {
          userId: "user-2",
          displayName: "Demo Player",
          photoURL: "https://placehold.co/200?text=User2",
          points: 1200,
          updatedAt: serverTimestamp()
        },
        {
          userId: "user-1",
          displayName: "Test User",
          photoURL: "https://placehold.co/200?text=User1",
          points: 500,
          updatedAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < leaderboard.length; i++) {
        await setDoc(doc(firestoreDb, "leaderboard", `leaderboard-${i+1}`), leaderboard[i]);
        console.log(`Added leaderboard entry: ${leaderboard[i].displayName}`);
      }
    }
    
    // Initialize rewards collection
    const rewardsSnapshot = await getDocs(collection(firestoreDb, "rewards"));
    if (rewardsSnapshot.empty) {
      // Add sample rewards
      const rewards = [
        {
          name: "Gift Card $10",
          description: "A $10 gift card for your next purchase",
          imageUrl: "https://placehold.co/400x200?text=Gift+Card",
          pointsCost: 1000,
          isAvailable: true,
          stock: 50,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "Premium Membership",
          description: "Get premium membership for one month",
          imageUrl: "https://placehold.co/400x200?text=Premium",
          pointsCost: 5000,
          isAvailable: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "Exclusive Merchandise",
          description: "Get exclusive merchandise from our store",
          imageUrl: "https://placehold.co/400x200?text=Merch",
          pointsCost: 3000,
          isAvailable: true,
          stock: 10,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < rewards.length; i++) {
        await setDoc(doc(firestoreDb, "rewards", `reward-${i+1}`), rewards[i]);
        console.log(`Added reward: ${rewards[i].name}`);
      }
    }
    
    // Initialize userRewards collection
    const userRewardsSnapshot = await getDocs(collection(firestoreDb, "userRewards"));
    if (userRewardsSnapshot.empty) {
      // Add sample user rewards
      const userRewards = [
        {
          userId: "user-1",
          rewardId: "reward-1",
          redeemed: true,
          redeemedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        },
        {
          userId: "user-2",
          rewardId: "reward-3",
          redeemed: false,
          redeemedAt: null,
          createdAt: serverTimestamp()
        },
        {
          userId: "user-3",
          rewardId: "reward-2",
          redeemed: true,
          redeemedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < userRewards.length; i++) {
        await setDoc(doc(firestoreDb, "userRewards", `userReward-${i+1}`), userRewards[i]);
        console.log(`Added user reward for user ${userRewards[i].userId}: ${userRewards[i].rewardId}`);
      }
    }
    
    console.log("All Firestore collections initialization complete!");
    return true;
  } catch (error) {
    console.error("Error initializing Firestore collections:", error);
    return false;
  }
}; 