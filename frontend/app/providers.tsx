'use client';

// Firebase is initialized via lib/firebase.ts (imported in pages that need it).
// This file is kept as the central providers wrapper for future additions (e.g. ThemeProvider).
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
