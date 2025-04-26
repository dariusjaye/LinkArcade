"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { useSiteSettings, SiteSettings } from '@/lib/contexts/SiteSettingsContext';
import { Button } from '@/components/ui/Button';

const TAILWIND_COLORS = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose'
];

export default function SiteSettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  
  // State for form values
  const [formValues, setFormValues] = useState<SiteSettings>(settings);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties (social)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'social' && typeof formValues.social === 'object') {
        setFormValues({
          ...formValues,
          social: {
            ...formValues.social,
            [child]: value
          }
        });
      }
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: checked
    });
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormValues({
          ...formValues,
          logoUrl: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle hero background upload
  const handleHeroBackgroundUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormValues({
          ...formValues,
          heroBackgroundUrl: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Clear logo
  const clearLogo = () => {
    setFormValues({
      ...formValues,
      logoUrl: '',
      useSiteName: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Clear hero background
  const clearHeroBackground = () => {
    setFormValues({
      ...formValues,
      heroBackgroundUrl: '/grid.svg'
    });
    if (heroImageInputRef.current) {
      heroImageInputRef.current.value = '';
    }
  };
  
  // Save settings
  const saveSettings = () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Simulate API call
    setTimeout(() => {
      updateSettings(formValues);
      setIsSaving(false);
      setSaveMessage('Settings saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }, 800);
  };
  
  // Reset settings to defaults
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      resetSettings();
      setFormValues(settings);
      setSaveMessage('Settings reset to defaults.');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Site Settings</h2>
      <p className="text-gray-400 mb-6">
        Customize your website&apos;s appearance, branding, and metadata
      </p>
      
      <div className="bg-gray-900 rounded-lg p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'general' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'appearance' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'hero' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('hero')}
          >
            Hero Banner
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'social' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('social')}
          >
            Social Media
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'seo' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
        </div>
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={formValues.siteName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Your site name"
              />
              <p className="mt-1 text-xs text-gray-500">This appears in the header, footer, and browser tab.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Site Description</label>
              <textarea
                name="siteDescription"
                value={formValues.siteDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="A short description of your site"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">Used in various places across the site.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Site Logo</label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Logo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearLogo}
                >
                  Clear Logo
                </Button>
              </div>
              {formValues.logoUrl && (
                <div className="mt-2 p-4 bg-gray-800 rounded-md">
                  <p className="text-sm mb-2">Logo Preview:</p>
                  <div className="w-40 h-16 flex items-center justify-center">
                    <img 
                      src={formValues.logoUrl} 
                      alt="Site Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="useSiteName"
                    checked={formValues.useSiteName}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-700 text-pink-600 focus:ring-pink-500 bg-gray-800"
                  />
                  <span className="text-sm">Use site name as logo if no image is uploaded</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Footer Text</label>
              <input
                type="text"
                name="footerText"
                value={formValues.footerText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Copyright text"
              />
              <p className="mt-1 text-xs text-gray-500">Custom text displayed in the footer.</p>
            </div>
          </div>
        )}
        
        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {TAILWIND_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`h-10 rounded-md ${formValues.primaryColor === color ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: `var(--${color}-500)` }}
                    onClick={() => setFormValues({...formValues, primaryColor: color})}
                    title={color}
                  ></button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Used for buttons, links, and accents.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Secondary Color</label>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {TAILWIND_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`h-10 rounded-md ${formValues.secondaryColor === color ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: `var(--${color}-500)` }}
                    onClick={() => setFormValues({...formValues, secondaryColor: color})}
                    title={color}
                  ></button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Used for gradients and secondary elements.</p>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-md">
              <h3 className="text-sm font-medium mb-3">Preview</h3>
              <div className="flex flex-col space-y-3">
                <div className={`py-2 px-4 rounded-md w-32 text-center bg-${formValues.primaryColor}-500 text-white`}>
                  Primary Button
                </div>
                <div className={`py-2 px-4 rounded-md w-32 text-center bg-${formValues.secondaryColor}-500 text-white`}>
                  Secondary Button
                </div>
                <div className={`w-full h-12 rounded-md bg-gradient-to-r from-${formValues.primaryColor}-500 to-${formValues.secondaryColor}-500`}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero Banner Settings */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Title</label>
              <input
                type="text"
                name="heroTitle"
                value={formValues.heroTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Main heading"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
              <textarea
                name="heroSubtitle"
                value={formValues.heroSubtitle}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Supporting text below main heading"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Hero Background</label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={heroImageInputRef}
                  onChange={handleHeroBackgroundUpload}
                  className="hidden"
                />
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => heroImageInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearHeroBackground}
                >
                  Use Default
                </Button>
              </div>
              <div className="mt-2 p-4 bg-gray-800 rounded-md">
                <p className="text-sm mb-2">Background Preview:</p>
                <div className="w-full h-32 rounded-md overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/50"></div>
                  {formValues.heroBackgroundUrl === '/grid.svg' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
                      <div className="absolute inset-0 bg-center" style={{backgroundImage: `url(${formValues.heroBackgroundUrl})`}}></div>
                    </div>
                  ) : (
                    <img 
                      src={formValues.heroBackgroundUrl} 
                      alt="Hero Background" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                      <h3 className="text-xl font-bold text-white mb-1 truncate">
                        {formValues.heroTitle}
                      </h3>
                      <p className="text-sm text-gray-200 truncate">
                        {formValues.heroSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Social Media Settings */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Twitter URL</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-700 bg-gray-700 text-gray-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </span>
                <input
                  type="url"
                  name="social.twitter"
                  value={formValues.social.twitter}
                  onChange={handleInputChange}
                  className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-md text-white"
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Facebook URL</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-700 bg-gray-700 text-gray-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                </span>
                <input
                  type="url"
                  name="social.facebook"
                  value={formValues.social.facebook}
                  onChange={handleInputChange}
                  className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-md text-white"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instagram URL</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-700 bg-gray-700 text-gray-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </span>
                <input
                  type="url"
                  name="social.instagram"
                  value={formValues.social.instagram}
                  onChange={handleInputChange}
                  className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-md text-white"
                  placeholder="https://instagram.com/yourusername"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Discord Invite URL</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-700 bg-gray-700 text-gray-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.0371c-1.6043.2928-3.2956.8667-4.886 1.5152a.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </span>
                <input
                  type="url"
                  name="social.discord"
                  value={formValues.social.discord}
                  onChange={handleInputChange}
                  className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-md text-white"
                  placeholder="https://discord.gg/invite"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* SEO Settings */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formValues.metaTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Site title for search engines"
              />
              <p className="mt-1 text-xs text-gray-500">Appears in browser tabs and search results.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea
                name="metaDescription"
                value={formValues.metaDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                placeholder="Brief description for search engines"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Shown in search engine results. Keep it under 160 characters.
                <span className="ml-2 text-gray-400">
                  {formValues.metaDescription.length}/160
                </span>
              </p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-700 pt-6">
          <Button 
            variant="outline" 
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
          
          <div className="flex items-center space-x-4">
            {saveMessage && (
              <p className="text-green-400 text-sm">
                {saveMessage}
              </p>
            )}
            
            <Button 
              variant="default" 
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 