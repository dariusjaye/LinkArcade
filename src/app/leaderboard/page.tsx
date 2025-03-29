import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  photoURL?: string;
  wagerAmount: number;
  winAmount: number;
  profit: number;
  gameCount: number;
}

export default function LeaderboardPage() {
  // This would normally come from a database query
  const leaderboardData: LeaderboardUser[] = [
    {
      id: '1',
      rank: 1,
      username: 'LuckyPlayer123',
      photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
      wagerAmount: 2500.75,
      winAmount: 4350.25,
      profit: 1849.50,
      gameCount: 87
    },
    {
      id: '2',
      rank: 2,
      username: 'CasinoKing',
      photoURL: 'https://randomuser.me/api/portraits/women/45.jpg',
      wagerAmount: 1890.50,
      winAmount: 3210.25,
      profit: 1319.75,
      gameCount: 63
    },
    {
      id: '3',
      rank: 3,
      username: 'GamblerPro',
      photoURL: 'https://randomuser.me/api/portraits/men/22.jpg',
      wagerAmount: 1750.25,
      winAmount: 2800.50,
      profit: 1050.25,
      gameCount: 55
    },
    {
      id: '4',
      rank: 4,
      username: 'HighRoller99',
      photoURL: 'https://randomuser.me/api/portraits/women/22.jpg',
      wagerAmount: 3500.75,
      winAmount: 4500.25,
      profit: 999.50,
      gameCount: 110
    },
    {
      id: '5',
      rank: 5,
      username: 'BetMaster',
      photoURL: 'https://randomuser.me/api/portraits/men/55.jpg',
      wagerAmount: 980.25,
      winAmount: 1900.50,
      profit: 920.25,
      gameCount: 42
    },
    {
      id: '6',
      rank: 6,
      username: 'LuckyCharm',
      photoURL: 'https://randomuser.me/api/portraits/women/67.jpg',
      wagerAmount: 1200.75,
      winAmount: 2000.25,
      profit: 799.50,
      gameCount: 38
    },
    {
      id: '7',
      rank: 7,
      username: 'VegasKing',
      photoURL: 'https://randomuser.me/api/portraits/men/41.jpg',
      wagerAmount: 2100.50,
      winAmount: 2850.25,
      profit: 749.75,
      gameCount: 76
    },
    {
      id: '8',
      rank: 8,
      username: 'JackpotHunter',
      photoURL: 'https://randomuser.me/api/portraits/women/33.jpg',
      wagerAmount: 850.25,
      winAmount: 1550.50,
      profit: 700.25,
      gameCount: 29
    },
    {
      id: '9',
      rank: 9,
      username: 'RiskTaker',
      photoURL: 'https://randomuser.me/api/portraits/men/89.jpg',
      wagerAmount: 1800.75,
      winAmount: 2450.25,
      profit: 649.50,
      gameCount: 65
    },
    {
      id: '10',
      rank: 10,
      username: 'CardShark',
      photoURL: 'https://randomuser.me/api/portraits/women/91.jpg',
      wagerAmount: 1500.25,
      winAmount: 2100.50,
      profit: 600.25,
      gameCount: 53
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-400 mb-8">
          Top players ranked by profit. See if you can reach the top!
        </p>
        
        {/* Time Filter */}
        <div className="flex space-x-2 mb-6">
          <button className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium">
            All Time
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            This Month
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            This Week
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Today
          </button>
        </div>
        
        {/* Leaderboard Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Wagered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Won
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Games
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboardData.map((user) => (
                  <tr 
                    key={user.id} 
                    className="bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`
                          flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm mr-2
                          ${user.rank === 1 ? 'bg-yellow-500 text-yellow-900' : 
                            user.rank === 2 ? 'bg-gray-300 text-gray-800' : 
                            user.rank === 3 ? 'bg-amber-600 text-amber-900' : 
                            'bg-gray-700 text-gray-300'}
                        `}>
                          {user.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center overflow-hidden mr-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span>{user.username.charAt(0)}</span>
                          )}
                        </div>
                        <div className="font-medium">{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {formatCurrency(user.wagerAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {formatCurrency(user.winAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-500">
                      {formatCurrency(user.profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {user.gameCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Join CTA */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Want to see your name on the leaderboard?</h2>
          <p className="text-gray-400 mb-6">
            Start playing games with your cashback rewards and climb the rankings!
          </p>
          <Link href="/games"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-pink-600 text-white font-medium shadow-lg hover:bg-pink-700 transition-colors"
          >
            Play Now
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 