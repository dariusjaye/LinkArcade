"use client";

import React from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/lib/contexts/SiteSettingsContext';

export default function Footer() {
  const { settings } = useSiteSettings();
  
  const hasSocialLinks = Object.values(settings.social).some(link => link && link.trim() !== '');
  
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName} 
                  className="h-8 mr-2"
                />
              ) : (
                <h2 className={`text-2xl font-bold text-${settings.primaryColor}-500`}>
                  {settings.siteName}
                </h2>
              )}
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              {settings.siteDescription}
            </p>
            
            {hasSocialLinks && (
              <div className="flex space-x-4 mb-6">
                {settings.social.twitter && (
                  <a 
                    href={settings.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                
                {settings.social.facebook && (
                  <a 
                    href={settings.social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                    </svg>
                  </a>
                )}
                
                {settings.social.instagram && (
                  <a 
                    href={settings.social.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                )}
                
                {settings.social.discord && (
                  <a 
                    href={settings.social.discord} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games" className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}>
                  Games
                </Link>
              </li>
              <li>
                <Link href="/rewards" className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}>
                  Rewards
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}>
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`text-gray-400 hover:text-${settings.primaryColor}-500 transition`}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p dangerouslySetInnerHTML={{ __html: settings.footerText }} />
        </div>
      </div>
    </footer>
  );
} 