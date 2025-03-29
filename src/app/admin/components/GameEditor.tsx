"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GameSettings } from './GamesManagement';

interface GameEditorProps {
  game: GameSettings;
  onSave: (game: GameSettings) => void;
  onCancel: () => void;
}

export default function GameEditor({ game, onSave, onCancel }: GameEditorProps) {
  const [formData, setFormData] = useState<GameSettings>({ ...game });
  const [activeTab, setActiveTab] = useState<string>('general');
  const [imagePreview, setImagePreview] = useState<string | null>(game.imageUrl || null);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // Handle custom settings changes
  const handleCustomSettingChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      customSettings: {
        ...formData.customSettings,
        [key]: typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value
      }
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData({ ...formData, imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update badge based on implementation status
    const updatedFormData = {
      ...formData,
      badge: formData.implemented ? 'Ready to Play' : 'Coming Soon'
    };
    onSave(updatedFormData);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Edit Game: {game.name}</h3>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Back to List
        </Button>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'general' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'appearance' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'gameplay' ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('gameplay')}
          >
            Gameplay Settings
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Game ID</label>
              <input
                type="text"
                name="id"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                value={formData.id}
                onChange={handleInputChange}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Game ID cannot be changed</p>
            </div>
            
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
                value={formData.multiplier}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-gray-500">Example: "2x" or "Up to 36x"</p>
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
        {activeTab === 'appearance' && (
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
              <label className="block text-sm font-medium mb-1">Game Image (Optional)</label>
              <div className="mt-1 flex items-center space-x-4">
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Game preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-gray-900 rounded-full p-1"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, imageUrl: undefined });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="flex justify-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <span>Upload image</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">PNG or JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Gameplay Settings */}
        {activeTab === 'gameplay' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              These settings are specific to each game type and affect gameplay mechanics.
            </p>
            
            {formData.id === 'coinflip' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Win Chance (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.customSettings?.winChance || 50}
                    onChange={(e) => handleCustomSettingChange('winChance', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">Default is 50% (fair coin)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Animation Duration (ms)</label>
                  <input
                    type="number"
                    min="500"
                    max="5000"
                    step="100"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.customSettings?.animationDuration || 2000}
                    onChange={(e) => handleCustomSettingChange('animationDuration', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {formData.id === 'roulette' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Wheel Spin Duration (ms)</label>
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    step="100"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.customSettings?.wheelSpeed || 3000}
                    onChange={(e) => handleCustomSettingChange('wheelSpeed', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeZero"
                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    checked={formData.customSettings?.includeZero !== false}
                    onChange={(e) => handleCustomSettingChange('includeZero', e.target.checked)}
                  />
                  <label htmlFor="includeZero" className="ml-2 block text-sm">
                    Include Zero on Wheel
                  </label>
                </div>
              </div>
            )}
            
            {formData.id === 'crash' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Growth Rate</label>
                  <input
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.customSettings?.growthRate || 1.6}
                    onChange={(e) => handleCustomSettingChange('growthRate', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">Higher values make the multiplier increase faster</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">High Multiplier Chance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.customSettings?.highMultiplierChance || 1}
                    onChange={(e) => handleCustomSettingChange('highMultiplierChance', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">Chance of getting a very high multiplier (10x+)</p>
                </div>
              </div>
            )}
            
            {formData.id === 'slots' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Spin Duration (ms)</label>
                  <input
                    type="number"
                    min="500"
                    max="5000"
                    step="100"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.customSettings?.spinDuration || 1000}
                    onChange={(e) => handleCustomSettingChange('spinDuration', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Win Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    value={formData.customSettings?.winRate || 20}
                    onChange={(e) => handleCustomSettingChange('winRate', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">Chance of hitting any winning combination</p>
                </div>
              </div>
            )}
            
            {(formData.id === 'dice' || formData.id === 'blackjack') && (
              <div className="p-6 bg-gray-800 rounded-lg text-center">
                <p>Settings for this game will be available when implemented.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
} 