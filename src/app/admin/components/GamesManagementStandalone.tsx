"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

// Define the game settings interface
export interface GameSettings {
  id: string;
  name: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  minBet: number;
  maxBet: number;
  multiplier: string;
  popular: boolean;
  implemented: boolean;
  badge: string;
  imageUrl?: string;
  customSettings?: Record<string, any>;
}

export default function GamesManagementStandalone() {
  const [games, setGames] = useState<GameSettings[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<GameSettings | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<string>('general');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Load games from localStorage on mount
  useEffect(() => {
    const loadGames = () => {
      const storedGames = localStorage.getItem('adminGameSettings');
      
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      } else {
        // If no stored games, load default games from the games page
        const defaultGames = [
          {
            id: 'coinflip',
            name: 'Coin Flip',
            description: 'Double your rewards with a 50/50 chance of winning. Simple, fast, and exciting!',
            gradientFrom: 'from-pink-500',
            gradientTo: 'to-purple-600',
            minBet: 0.1,
            maxBet: 100,
            multiplier: '2x',
            popular: true,
            implemented: true,
            badge: 'Ready to Play',
            customSettings: {
              winChance: 50,
              animationDuration: 2000,
              headsSideText: 'H',
              tailsSideText: 'T',
              headsSideColor: 'bg-yellow-500',
              tailsSideColor: 'bg-yellow-400',
              textColor: 'text-yellow-900',
              coinEdgeVisible: true,
              coinRidgesVisible: true,
              coinEmbossLevel: 'medium',
              coinShineEffect: 'light',
              coinSound: 'classic',
              headsImageUrl: '',
              tailsImageUrl: '',
              useCustomImages: false
            }
          },
          {
            id: 'roulette',
            name: 'Roulette',
            description: 'Test your luck on the spinning wheel with multiple betting options.',
            gradientFrom: 'from-green-500',
            gradientTo: 'to-cyan-600',
            minBet: 0.5,
            maxBet: 200,
            multiplier: 'Up to 36x',
            popular: true,
            implemented: true,
            badge: 'Ready to Play',
            customSettings: {
              wheelSpeed: 3000,
              includeZero: true
            }
          },
          {
            id: 'crash',
            name: 'Crash',
            description: 'Watch the multiplier rise and cash out before it crashes to win big!',
            gradientFrom: 'from-red-500',
            gradientTo: 'to-yellow-600',
            minBet: 1,
            maxBet: 500,
            multiplier: 'Unlimited',
            popular: true,
            implemented: true,
            badge: 'Ready to Play',
            customSettings: {
              growthRate: 1.6,
              highMultiplierChance: 1
            }
          },
          {
            id: 'slots',
            name: 'Slots',
            description: 'Spin the reels and match symbols to win big. Classic casino slots experience!',
            gradientFrom: 'from-purple-500',
            gradientTo: 'to-pink-600',
            minBet: 0.5,
            maxBet: 100,
            multiplier: 'Up to 500x',
            popular: false,
            implemented: true,
            badge: 'Ready to Play',
            customSettings: {
              reelCount: 9,
              spinDuration: 1000
            }
          },
          {
            id: 'dice',
            name: 'Dice',
            description: 'Roll the dice and win big based on your prediction. Choose your odds and risk!',
            gradientFrom: 'from-blue-500',
            gradientTo: 'to-indigo-600',
            minBet: 0.1,
            maxBet: 300,
            multiplier: '1.01x to 495x',
            popular: false,
            implemented: false,
            badge: 'Coming Soon'
          },
          {
            id: 'blackjack',
            name: 'Blackjack',
            description: 'Try to get as close to 21 as possible without going over. Beat the dealer to win!',
            gradientFrom: 'from-yellow-500',
            gradientTo: 'to-red-600',
            minBet: 1,
            maxBet: 500,
            multiplier: '2x',
            popular: false,
            implemented: false,
            badge: 'Coming Soon'
          },
        ];
        
        setGames(defaultGames);
        localStorage.setItem('adminGameSettings', JSON.stringify(defaultGames));
      }
      
      setLoading(false);
    };
    
    loadGames();
  }, []);
  
  // Save games to localStorage
  const saveGames = (updatedGames: GameSettings[]) => {
    localStorage.setItem('adminGameSettings', JSON.stringify(updatedGames));
    setGames(updatedGames);
  };
  
  // Update a specific game
  const updateGame = (updatedGame: GameSettings) => {
    const updatedGames = games.map(game => 
      game.id === updatedGame.id ? updatedGame : game
    );
    
    saveGames(updatedGames);
    setSelectedGame(null);
    setEditMode(false);
    setFormData(null);
  };
  
  // Make a game featured (popular)
  const toggleFeatured = (gameId: string) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return { ...game, popular: !game.popular };
      }
      return game;
    });
    
    saveGames(updatedGames);
  };
  
  // Toggle game implementation status
  const toggleImplemented = (gameId: string) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return { 
          ...game, 
          implemented: !game.implemented,
          badge: !game.implemented ? 'Ready to Play' : 'Coming Soon'
        };
      }
      return game;
    });
    
    saveGames(updatedGames);
  };
  
  // Handle editing a game
  const handleEditGame = (game: GameSettings) => {
    setSelectedGame(game);
    setFormData({...game});
    setImagePreview(game.imageUrl || null);
    setEditMode(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle custom settings input changes
  const handleCustomSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      customSettings: {
        ...formData.customSettings,
        [name]: value
      }
    });
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };
  
  // Save edits
  const handleSaveGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    // Update badge based on implementation status
    const updatedFormData = {
      ...formData,
      badge: formData.implemented ? 'Ready to Play' : 'Coming Soon'
    };
    
    updateGame(updatedFormData);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedGame(null);
    setEditMode(false);
    setFormData(null);
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setImagePreview(imageUrl);
      if (formData) {
        // Store the file information for display
        setFormData({ 
          ...formData, 
          imageUrl,
          customSettings: {
            ...formData.customSettings,
            imageInfo: {
              fileName: file.name,
              fileSize: formatFileSize(file.size),
              fileType: file.type,
              uploadDate: new Date().toISOString()
            }
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Handle coin side image upload
  const handleCoinImageUpload = (side: 'heads' | 'tails') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;
    
    // Check file size (limit to 2MB for coin images)
    if (file.size > 2 * 1024 * 1024) {
      alert(`Image size exceeds 2MB limit. Please choose a smaller image for the ${side} side.`);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      
      // Update form data with the new image URL
      const updatedSettings = { ...formData.customSettings };
      
      if (side === 'heads') {
        updatedSettings.headsImageUrl = imageUrl;
        updatedSettings.headsImageInfo = {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: file.type,
          uploadDate: new Date().toISOString()
        };
      } else {
        updatedSettings.tailsImageUrl = imageUrl;
        updatedSettings.tailsImageInfo = {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: file.type,
          uploadDate: new Date().toISOString()
        };
      }
      
      // Enable custom images if at least one side has an image
      if (side === 'heads' && imageUrl || side === 'tails' && formData.customSettings?.tailsImageUrl) {
        updatedSettings.useCustomImages = true;
      } else if (side === 'tails' && imageUrl || side === 'tails' && formData.customSettings?.headsImageUrl) {
        updatedSettings.useCustomImages = true;
      }
      
      setFormData({
        ...formData,
        customSettings: updatedSettings
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Remove coin side image
  const removeCoinImage = (side: 'heads' | 'tails') => {
    if (!formData) return;
    
    const updatedSettings = { ...formData.customSettings };
    
    if (side === 'heads') {
      delete updatedSettings.headsImageUrl;
      delete updatedSettings.headsImageInfo;
    } else {
      delete updatedSettings.tailsImageUrl;
      delete updatedSettings.tailsImageInfo;
    }
    
    // Disable custom images if both sides don't have images
    if (!updatedSettings.headsImageUrl && !updatedSettings.tailsImageUrl) {
      updatedSettings.useCustomImages = false;
    }
    
    setFormData({
      ...formData,
      customSettings: updatedSettings
    });
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Helper functions for coin preview
  // Add these after the formatFileSize function
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
  
  if (loading) {
    return <div className="p-8 text-center">Loading games...</div>;
  }
  
  if (editMode && formData) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Edit Game: {formData.name}</h2>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Game Settings</h3>
            <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
              Back to List
            </Button>
          </div>
          
          <div className="flex space-x-2 mt-4 border-b border-gray-700">
            <button
              type="button"
              className={`px-4 py-2 ${
                activeEditTab === 'general' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
              } rounded-t-md font-medium`}
              onClick={() => setActiveEditTab('general')}
            >
              General
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${
                activeEditTab === 'appearance' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
              } rounded-t-md font-medium`}
              onClick={() => setActiveEditTab('appearance')}
            >
              Appearance
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${
                activeEditTab === 'specific' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
              } rounded-t-md font-medium`}
              onClick={() => setActiveEditTab('specific')}
            >
              Game Specific
            </button>
          </div>
          
          <form onSubmit={handleSaveGame}>
            {/* General Settings */}
            {activeEditTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Game Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Bet</label>
                    <input
                      type="number"
                      name="minBet"
                      step="0.1"
                      min="0.1"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      value={formData.minBet}
                      onChange={handleNumberChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Bet</label>
                    <input
                      type="number"
                      name="maxBet"
                      step="1"
                      min="1"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      value={formData.maxBet}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Multiplier</label>
                  <input
                    type="text"
                    name="multiplier"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData?.multiplier}
                    onChange={handleInputChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">Example: &quot;2x&quot; or &quot;Up to 36x&quot;</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="implemented"
                      name="implemented"
                      className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      checked={formData.implemented}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="implemented" className="ml-2 block text-sm">
                      Game Active
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="popular"
                      name="popular"
                      className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      checked={formData.popular}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="popular" className="ml-2 block text-sm">
                      Featured Game
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeEditTab === 'appearance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Gradient Start Color</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="gradientFrom"
                        className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        value={formData.gradientFrom}
                        onChange={handleInputChange}
                      />
                      <div className={`w-10 h-10 rounded ${formData.gradientFrom}`}></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Tailwind class (e.g., from-pink-500)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Gradient End Color</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="gradientTo"
                        className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        value={formData.gradientTo}
                        onChange={handleInputChange}
                      />
                      <div className={`w-10 h-10 rounded ${formData.gradientTo}`}></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Tailwind class (e.g., to-purple-600)</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Preview</label>
                  <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${formData.gradientFrom} ${formData.gradientTo} flex items-center justify-center`}>
                    <span className="text-white font-bold text-xl">{formData.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Game Cover Image</label>
                  <div className="mt-1 flex flex-col sm:flex-row gap-4">
                    {imagePreview && (
                      <div className="relative w-64 h-40 rounded-lg overflow-hidden">
                        <img src={imagePreview} alt="Game preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-gray-900/70 rounded-full p-1.5"
                          onClick={() => {
                            setImagePreview(null);
                            // Remove image URL and image info from form data
                            if (formData) {
                              const newFormData = { ...formData, imageUrl: undefined };
                              if (newFormData.customSettings?.imageInfo) {
                                const { imageInfo, ...restSettings } = newFormData.customSettings;
                                newFormData.customSettings = restSettings;
                              }
                              setFormData(newFormData);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <label className="flex justify-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <span>Upload cover image</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG or GIF up to 5MB. Recommended size: 1280x720px (16:9 ratio)
                      </p>
                      {formData?.customSettings?.imageInfo && (
                        <div className="mt-2 text-xs text-gray-400">
                          <p>File: {formData.customSettings.imageInfo.fileName}</p>
                          <p>Size: {formData.customSettings.imageInfo.fileSize}</p>
                          <p>Type: {formData.customSettings.imageInfo.fileType}</p>
                          <p>Uploaded: {new Date(formData.customSettings.imageInfo.uploadDate).toLocaleString()}</p>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        A good cover image will make your game more attractive to players and increase gameplay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Game specific tab */}
            {activeEditTab === 'specific' && (
              <div className="grid grid-cols-1 gap-6 mt-4">
                {formData.id === 'coinflip' && (
                  <>
                    <h3 className="text-xl font-bold col-span-full">Coin Customization</h3>
                    <p className="text-gray-400 col-span-full -mt-4">
                      Customize the appearance of the coin in the Coin Flip game
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Heads Side Text</label>
                        <input
                          type="text"
                          name="headsSideText"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.headsSideText || 'H'}
                          onChange={handleCustomSettingChange}
                          maxLength={3}
                        />
                        <p className="mt-1 text-xs text-gray-500">Text displayed on the heads side (1-3 characters)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Tails Side Text</label>
                        <input
                          type="text"
                          name="tailsSideText"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.tailsSideText || 'T'}
                          onChange={handleCustomSettingChange}
                          maxLength={3}
                        />
                        <p className="mt-1 text-xs text-gray-500">Text displayed on the tails side (1-3 characters)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Heads Side Color</label>
                        <select
                          name="headsSideColor"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.headsSideColor || 'bg-yellow-500'}
                          onChange={handleCustomSettingChange}
                        >
                          <option value="bg-yellow-500">Gold</option>
                          <option value="bg-gray-300">Silver</option>
                          <option value="bg-amber-700">Bronze</option>
                          <option value="bg-green-500">Green</option>
                          <option value="bg-blue-500">Blue</option>
                          <option value="bg-red-500">Red</option>
                          <option value="bg-purple-500">Purple</option>
                          <option value="bg-pink-500">Pink</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Tails Side Color</label>
                        <select
                          name="tailsSideColor"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.tailsSideColor || 'bg-yellow-400'}
                          onChange={handleCustomSettingChange}
                        >
                          <option value="bg-yellow-400">Light Gold</option>
                          <option value="bg-gray-400">Light Silver</option>
                          <option value="bg-amber-600">Light Bronze</option>
                          <option value="bg-green-400">Light Green</option>
                          <option value="bg-blue-400">Light Blue</option>
                          <option value="bg-red-400">Light Red</option>
                          <option value="bg-purple-400">Light Purple</option>
                          <option value="bg-pink-400">Light Pink</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Text Color</label>
                        <select
                          name="textColor"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.textColor || 'text-yellow-900'}
                          onChange={handleCustomSettingChange}
                        >
                          <option value="text-yellow-900">Dark Gold</option>
                          <option value="text-gray-900">Dark Gray</option>
                          <option value="text-white">White</option>
                          <option value="text-black">Black</option>
                          <option value="text-blue-900">Dark Blue</option>
                          <option value="text-red-900">Dark Red</option>
                          <option value="text-green-900">Dark Green</option>
                          <option value="text-purple-900">Dark Purple</option>
                          <option value="text-pink-900">Dark Pink</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Coin Preview</h4>
                      <div className="flex items-center justify-start space-x-6">
                        <div className="text-center">
                          <div className={`w-20 h-20 rounded-full relative flex items-center justify-center ${formData.customSettings?.headsSideColor || 'bg-yellow-500'}`}
                               style={{
                                 boxShadow: formData.customSettings?.coinEdgeVisible 
                                   ? '0 0 5px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.2)' 
                                   : 'none',
                                 border: formData.customSettings?.coinEdgeVisible 
                                   ? '2px solid rgba(0, 0, 0, 0.2)' 
                                   : 'none',
                                 backgroundImage: formData.customSettings?.useCustomImages && formData.customSettings?.headsImageUrl
                                   ? 'none'
                                   : formData.customSettings?.coinRidgesVisible 
                                     ? 'repeating-conic-gradient(rgba(0, 0, 0, 0) 0deg 5deg, rgba(0, 0, 0, 0.1) 5deg 10deg)' 
                                     : 'none',
                                 overflow: 'hidden'
                               }}
                          >
                            {formData.customSettings?.useCustomImages && formData.customSettings?.headsImageUrl && (
                              <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${formData.customSettings.headsImageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                zIndex: 1
                              }} />
                            )}
                            <div style={{
                              position: 'absolute',
                              inset: getEmbossLevel(formData.customSettings?.coinEmbossLevel),
                              borderRadius: '50%',
                              boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: formData.customSettings?.useCustomImages && formData.customSettings?.headsImageUrl ? 2 : 1
                            }}>
                              {(!formData.customSettings?.useCustomImages || !formData.customSettings?.headsImageUrl) && (
                                <span className={`text-xl font-bold ${formData.customSettings?.textColor || 'text-yellow-900'}`}>
                                  {formData.customSettings?.headsSideText || 'H'}
                                </span>
                              )}
                            </div>
                            {formData.customSettings?.coinShineEffect !== 'none' && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, ${getShineOpacity(formData.customSettings?.coinShineEffect)}) 0%, rgba(255, 255, 255, 0) 60%)`,
                                zIndex: formData.customSettings?.useCustomImages && formData.customSettings?.headsImageUrl ? 3 : 2
                              }}></div>
                            )}
                          </div>
                          <p className="mt-1 text-sm">Heads</p>
                        </div>
                        
                        <div className="text-center">
                          <div className={`w-20 h-20 rounded-full relative flex items-center justify-center ${formData.customSettings?.tailsSideColor || 'bg-yellow-400'}`}
                               style={{
                                 boxShadow: formData.customSettings?.coinEdgeVisible 
                                   ? '0 0 5px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.2)' 
                                   : 'none',
                                 border: formData.customSettings?.coinEdgeVisible 
                                   ? '2px solid rgba(0, 0, 0, 0.2)' 
                                   : 'none',
                                 backgroundImage: formData.customSettings?.useCustomImages && formData.customSettings?.tailsImageUrl
                                   ? 'none'
                                   : formData.customSettings?.coinRidgesVisible 
                                     ? 'repeating-conic-gradient(rgba(0, 0, 0, 0) 0deg 5deg, rgba(0, 0, 0, 0.1) 5deg 10deg)' 
                                     : 'none',
                                 overflow: 'hidden'
                               }}
                          >
                            {formData.customSettings?.useCustomImages && formData.customSettings?.tailsImageUrl && (
                              <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${formData.customSettings.tailsImageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                zIndex: 1
                              }} />
                            )}
                            <div style={{
                              position: 'absolute',
                              inset: getEmbossLevel(formData.customSettings?.coinEmbossLevel),
                              borderRadius: '50%',
                              boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: formData.customSettings?.useCustomImages && formData.customSettings?.tailsImageUrl ? 2 : 1
                            }}>
                              {(!formData.customSettings?.useCustomImages || !formData.customSettings?.tailsImageUrl) && (
                                <span className={`text-xl font-bold ${formData.customSettings?.textColor || 'text-yellow-900'}`}>
                                  {formData.customSettings?.tailsSideText || 'T'}
                                </span>
                              )}
                            </div>
                            {formData.customSettings?.coinShineEffect !== 'none' && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, ${getShineOpacity(formData.customSettings?.coinShineEffect)}) 0%, rgba(255, 255, 255, 0) 60%)`,
                                zIndex: formData.customSettings?.useCustomImages && formData.customSettings?.tailsImageUrl ? 3 : 2
                              }}></div>
                            )}
                          </div>
                          <p className="mt-1 text-sm">Tails</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-6 mt-6">
                      <h4 className="text-lg font-medium mb-3">Coin Images</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Upload custom images for the heads and tails sides of the coin
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                        {/* Heads Image Upload */}
                        <div className="border border-gray-700 rounded-lg p-4">
                          <h5 className="text-md font-medium mb-2">Heads Side Image</h5>
                          <div className="bg-gray-900 rounded-lg p-4 min-h-[180px] flex flex-col items-center justify-center mb-4">
                            {formData.customSettings?.headsImageUrl ? (
                              <div className="relative w-full mb-2">
                                <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-2 border-gray-700">
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${formData.customSettings.headsImageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCoinImage('heads')}
                                  className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                {formData.customSettings?.headsImageInfo && (
                                  <div className="mt-3 text-xs text-center text-gray-400">
                                    <p>{formData.customSettings.headsImageInfo.fileName}</p>
                                    <p>{formData.customSettings.headsImageInfo.fileSize}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="mb-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-gray-500 text-sm text-center">No image uploaded for heads side</p>
                              </>
                            )}
                          </div>
                          <label className="flex justify-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                            <span>Upload Heads Image</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleCoinImageUpload('heads')}
                            />
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG or GIF up to 2MB. Square images work best.
                          </p>
                        </div>
                        
                        {/* Tails Image Upload */}
                        <div className="border border-gray-700 rounded-lg p-4">
                          <h5 className="text-md font-medium mb-2">Tails Side Image</h5>
                          <div className="bg-gray-900 rounded-lg p-4 min-h-[180px] flex flex-col items-center justify-center mb-4">
                            {formData.customSettings?.tailsImageUrl ? (
                              <div className="relative w-full mb-2">
                                <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-2 border-gray-700">
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${formData.customSettings.tailsImageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCoinImage('tails')}
                                  className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                {formData.customSettings?.tailsImageInfo && (
                                  <div className="mt-3 text-xs text-center text-gray-400">
                                    <p>{formData.customSettings.tailsImageInfo.fileName}</p>
                                    <p>{formData.customSettings.tailsImageInfo.fileSize}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="mb-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-gray-500 text-sm text-center">No image uploaded for tails side</p>
                              </>
                            )}
                          </div>
                          <label className="flex justify-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                            <span>Upload Tails Image</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleCoinImageUpload('tails')}
                            />
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG or GIF up to 2MB. Square images work best.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-5">
                        <input
                          type="checkbox"
                          id="useCustomImages"
                          className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          checked={formData.customSettings?.useCustomImages || false}
                          onChange={(e) => {
                            handleCustomSettingChange({
                              target: {
                                name: 'useCustomImages',
                                value: e.target.checked
                              }
                            } as any);
                          }}
                          disabled={!formData.customSettings?.headsImageUrl && !formData.customSettings?.tailsImageUrl}
                        />
                        <label htmlFor="useCustomImages" className="ml-2 block text-sm">
                          Use custom images instead of colored backgrounds
                        </label>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Note: To use custom images, you must upload at least one side. If only one side has an image, 
                        the other side will use the colored background with text.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Coin Edge</label>
                        <select
                          name="coinEdgeVisible"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.coinEdgeVisible === false ? 'false' : 'true'}
                          onChange={(e) => {
                            handleCustomSettingChange({
                              target: {
                                name: 'coinEdgeVisible',
                                value: e.target.value === 'true'
                              }
                            } as any);
                          }}
                        >
                          <option value="true">Visible</option>
                          <option value="false">Hidden</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Show the coin's edge for a 3D effect</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Coin Ridges</label>
                        <select
                          name="coinRidgesVisible"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.coinRidgesVisible === false ? 'false' : 'true'}
                          onChange={(e) => {
                            handleCustomSettingChange({
                              target: {
                                name: 'coinRidgesVisible',
                                value: e.target.value === 'true'
                              }
                            } as any);
                          }}
                        >
                          <option value="true">Visible</option>
                          <option value="false">Hidden</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Show ridged texture on coin edges</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Coin Emboss Level</label>
                        <select
                          name="coinEmbossLevel"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.coinEmbossLevel || 'medium'}
                          onChange={handleCustomSettingChange}
                        >
                          <option value="none">None</option>
                          <option value="light">Light</option>
                          <option value="medium">Medium</option>
                          <option value="heavy">Heavy</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">How raised the center embossed area appears</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Shine Effect</label>
                        <select
                          name="coinShineEffect"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.coinShineEffect || 'light'}
                          onChange={handleCustomSettingChange}
                        >
                          <option value="none">None</option>
                          <option value="light">Light</option>
                          <option value="medium">Medium</option>
                          <option value="strong">Strong</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Light reflection on the coin surface</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Coin Sound</label>
                        <select
                          name="coinSound"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                          value={formData.customSettings?.coinSound || 'classic'}
                          onChange={handleCustomSettingChange}
                        >
                          <option value="none">No Sound</option>
                          <option value="classic">Classic Metal</option>
                          <option value="golden">Golden Coin</option>
                          <option value="silver">Silver Coin</option>
                          <option value="fantasy">Fantasy Coin</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Sound played during coin flip</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2">Game Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Animation Duration (ms)</label>
                          <input
                            type="number"
                            name="animationDuration"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            value={formData.customSettings?.animationDuration || 2000}
                            onChange={handleCustomSettingChange}
                            min={500}
                            max={5000}
                            step={100}
                          />
                          <p className="mt-1 text-xs text-gray-500">Duration of coin flip animation in milliseconds (500-5000)</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Win Chance (%)</label>
                          <input
                            type="number"
                            name="winChance"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            value={formData.customSettings?.winChance || 50}
                            onChange={handleCustomSettingChange}
                            min={1}
                            max={99}
                            step={1}
                          />
                          <p className="mt-1 text-xs text-gray-500">Chance of winning (1-99%)</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {formData.id !== 'coinflip' && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No specific settings available for this game type.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" type="button" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button variant="default" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Games Management</h2>
      <p className="text-gray-400 mb-6">
        Customize game settings, appearance, and parameters
      </p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Game
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Bet Range
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Multiplier
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {games.map(game => (
              <tr key={game.id} className="hover:bg-gray-700/50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {game.imageUrl ? (
                      <div className="w-12 h-8 rounded mr-3 overflow-hidden">
                        <img 
                          src={game.imageUrl} 
                          alt={game.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-12 h-8 rounded mr-3 bg-gradient-to-br ${game.gradientFrom} ${game.gradientTo}`}></div>
                    )}
                    <div>
                      <div className="font-medium">{game.name}</div>
                      <div className="text-xs text-gray-400">{game.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      game.implemented ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {game.implemented ? 'Active' : 'Coming Soon'}
                    </span>
                    <span className={`text-xs mt-1 ${game.popular ? 'text-pink-400' : 'text-gray-400'}`}>
                      {game.popular ? 'Featured' : 'Not Featured'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  ${game.minBet} - ${game.maxBet}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {game.multiplier}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleEditGame(game)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant={game.popular ? "default" : "outline"} 
                    size="sm"
                    onClick={() => toggleFeatured(game.id)}
                  >
                    {game.popular ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button 
                    variant={game.implemented ? "success" : "secondary"} 
                    size="sm"
                    onClick={() => toggleImplemented(game.id)}
                  >
                    {game.implemented ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 