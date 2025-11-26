import { useEffect } from 'react';
import './App.css';
import { MainLayout } from './layouts/MainLayout';

function App() {
  // Initialize theme
  useEffect(() => {
    // Check for saved theme or system preference
    // For now, let's default to dark mode for that "premium" feel mentioned in the prompt
    // or respect system preference.
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }, []);

  return (
    <MainLayout />
  );
}

export default App;
