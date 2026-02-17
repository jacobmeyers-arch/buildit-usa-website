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
import UpsellScreen from './components/UpsellScreen';
import MagicLinkPending from './components/MagicLinkPending';
import PaymentSuccess from './components/PaymentSuccess';
import ProjectDashboard from './components/ProjectDashboard';

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
      return <UpsellScreen />;
    
    case 'magicLinkPending':
      return <MagicLinkPending />;
    
    case 'paymentSuccess':
      return <PaymentSuccess />;
    
    case 'dashboard':
      return <ProjectDashboard />;
    
    case 'report':
      return <div className="min-h-screen bg-iron text-parchment p-8">Report (TODO)</div>;
    
    default:
      return <SplashScreen />;
  }
}
