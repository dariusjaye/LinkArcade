"use client";

import React from 'react';
import FirebaseGamesList from '@/components/FirebaseGamesList';
import PageHeader from '@/components/ui/PageHeader';

export default function GamesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Games" 
        description="Play your favorite games and win big." 
      />
      
      <FirebaseGamesList />
    </main>
  );
} 