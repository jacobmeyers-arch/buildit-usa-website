import React from 'react';
import { useProject } from './context/ProjectContext';
import SplashScreen from './components/SplashScreen';
import Camera from './components/Camera';
import PhotoPreview from './components/PhotoPreview';
import AnalyzingScreen from './components/AnalyzingScreen';
import AIAnalysis from './components/AIAnalysis';
import EmailCapture from './components/EmailCapture';
import BudgetQuestion from './components/BudgetQuestion';

export default function App() {
  const { appScreen } = useProject();

  // State-based routing
  switch (appScreen) {
    case 'splash':
      return <SplashScreen />;
    
    case 'camera':
      return <Camera />;
    
    case 'preview':
      return <PhotoPreview />;
    
    case 'analyzing':
      return <AnalyzingScreen />;
    
    case 'analysis':
      return <AIAnalysis />;
    
    case 'email':
      return <EmailCapture />;
    
    case 'budgetQuestion':
      return <BudgetQuestion />;
    
    case 'magicLinkPending':
      return <div className="min-h-screen bg-iron text-parchment p-8">Check Your Email (TODO)</div>;
    
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
