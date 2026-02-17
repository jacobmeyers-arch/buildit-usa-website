import React from 'react';
import { useProject } from './context/ProjectContext';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const { appScreen } = useProject();

  // State-based routing
  switch (appScreen) {
    case 'splash':
      return <SplashScreen />;
    
    case 'camera':
      return <div className="min-h-screen bg-iron text-parchment p-8">Camera Screen (TODO)</div>;
    
    case 'preview':
      return <div className="min-h-screen bg-iron text-parchment p-8">Preview Screen (TODO)</div>;
    
    case 'analyzing':
      return <div className="min-h-screen bg-iron text-parchment p-8">Analyzing... (TODO)</div>;
    
    case 'analysis':
      return <div className="min-h-screen bg-iron text-parchment p-8">Analysis Results (TODO)</div>;
    
    case 'email':
      return <div className="min-h-screen bg-iron text-parchment p-8">Email Capture (TODO)</div>;
    
    case 'magicLinkPending':
      return <div className="min-h-screen bg-iron text-parchment p-8">Check Your Email (TODO)</div>;
    
    case 'budgetQuestion':
      return <div className="min-h-screen bg-iron text-parchment p-8">Budget Question (TODO)</div>;
    
    case 'scoping':
      return <div className="min-h-screen bg-iron text-parchment p-8">Scoping... (TODO)</div>;
    
    case 'estimate':
      return <div className="min-h-screen bg-iron text-parchment p-8">Estimate (TODO)</div>;
    
    case 'upsell':
      return <div className="min-h-screen bg-iron text-parchment p-8">Upgrade Offer (TODO)</div>;
    
    case 'paymentSuccess':
      return <div className="min-h-screen bg-iron text-parchment p-8">Payment Success (TODO)</div>;
    
    case 'dashboard':
      return <div className="min-h-screen bg-iron text-parchment p-8">Dashboard (TODO)</div>;
    
    case 'report':
      return <div className="min-h-screen bg-iron text-parchment p-8">Report (TODO)</div>;
    
    default:
      return <SplashScreen />;
  }
}
