import React from 'react';
import { useProject } from './context/ProjectContext';
import SplashScreen from './components/SplashScreen';
import CameraView from './components/CameraView';
import PhotoPreview from './components/PhotoPreview';
import AnalyzingScreen from './components/AnalyzingScreen';
import AIAnalysis from './components/AIAnalysis';
import EmailCapture from './components/EmailCapture';
import BudgetQuestion from './components/BudgetQuestion';
import ScopingSession from './components/ScopingSession';
import ScopeEstimate from './components/ScopeEstimate';

export default function App() {
  const { appScreen } = useProject();

  // State-based routing
  switch (appScreen) {
    case 'splash':
      return <SplashScreen />;
    
    case 'camera':
      return <CameraView />;
    
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
    
    case 'scoping':
      return <ScopingSession />;
    
    case 'estimate':
      return <ScopeEstimate />;
    
    case 'upsell':
      return <div className="min-h-screen bg-iron text-parchment p-8">Upgrade Offer (TODO)</div>;
    
    case 'magicLinkPending':
      return <div className="min-h-screen bg-iron text-parchment p-8">Check Your Email (TODO)</div>;
    
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
