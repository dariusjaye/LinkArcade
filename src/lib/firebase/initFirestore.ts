"use client";

import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Initialize Firestore with sample data for testing
 * This function should be called from a client component (like a settings page)
 */
export const initializeFirestore = async () => {
  console.log("Initializing Firestore with sample data...");
  
  try {
    // Check if games collection already has data
    const gamesSnapshot = await getDocs(collection(db, "games"));
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < games.length; i++) {
        await setDoc(doc(db, "games", `game-${i+1}`), games[i]);
        console.log(`Added game: ${games[i].name}`);
      }
    }
    
    // Check if rewards collection already has data
    const rewardsSnapshot = await getDocs(collection(db, "rewards"));
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
        await setDoc(doc(db, "rewards", `reward-${i+1}`), rewards[i]);
        console.log(`Added reward: ${rewards[i].name}`);
      }
    }
    
    // Add some dummy leaderboard entries if none exist
    const leaderboardSnapshot = await getDocs(collection(db, "leaderboard"));
    if (leaderboardSnapshot.empty) {
      const dummyLeaderboard = [
        {
          userId: "dummy-1",
          displayName: "HighRoller",
          photoURL: "https://placehold.co/200?text=HR",
          points: 15000,
          updatedAt: serverTimestamp()
        },
        {
          userId: "dummy-2",
          displayName: "LuckyWinner",
          photoURL: "https://placehold.co/200?text=LW",
          points: 12500,
          updatedAt: serverTimestamp()
        },
        {
          userId: "dummy-3",
          displayName: "BigSpender",
          photoURL: "https://placehold.co/200?text=BS",
          points: 10000,
          updatedAt: serverTimestamp()
        }
      ];
      
      for (let i = 0; i < dummyLeaderboard.length; i++) {
        await setDoc(doc(db, "leaderboard", `leaderboard-${i+1}`), dummyLeaderboard[i]);
        console.log(`Added leaderboard entry: ${dummyLeaderboard[i].displayName}`);
      }
    }
    
    console.log("Firestore initialization complete!");
    return true;
  } catch (error) {
    console.error("Error initializing Firestore:", error);
    return false;
  }
}; 