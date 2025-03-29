"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SiteSettings {
  // General site settings
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundUrl: string;
  
  // Logo settings
  logoUrl: string;
  useSiteName: boolean;
  
  // Social media links
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
    discord: string;
  };
  
  // Footer customization
  footerText: string;
  
  // SEO settings
  metaTitle: string;
  metaDescription: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'LinkArcade',
  siteDescription: 'The ultimate platform to gamble with cashback rewards from our online Shopify shop',
  primaryColor: 'pink',
  secondaryColor: 'purple',
  
  heroTitle: 'Play Games and Win with LinkArcade',
  heroSubtitle: 'The ultimate play-to-earn platform where your shopping rewards become gaming tokens. Play, win, and withdraw real cash.',
  heroBackgroundUrl: '/grid.svg',
  
  logoUrl: '',
  useSiteName: true,
  
  social: {
    twitter: '',
    facebook: '',
    instagram: '',
    discord: '',
  },
  
  footerText: '© 2023 LinkArcade. All rights reserved.',
  
  metaTitle: 'LinkArcade - Gamble with Your Cashback Rewards',
  metaDescription: 'The ultimate platform to gamble with cashback rewards from our online Shopify shop',
};

type SiteSettingsContextType = {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSettings: () => void;
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('siteSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing stored site settings:', error);
      }
    }
  }, []);

  // Update settings function
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
  };

  // Reset settings function
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('siteSettings', JSON.stringify(defaultSettings));
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
} 