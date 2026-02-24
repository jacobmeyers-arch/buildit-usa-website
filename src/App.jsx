/**
 * App.jsx — Main state-based router for BuildIt USA
 * 
 * Modified: 2026-02-17 — Added PropertyReport import + 3 address flow screens
 *   (addressInput, profileLoading, propertyProfile)
 */

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
import PropertyReport from './components/PropertyReport';
import AddressInput from './components/AddressInput';
import ProfileLoading from './components/ProfileLoading';
import PropertyProfileCard from './components/PropertyProfileCard';

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
      return <PropertyReport />;

    // Address-to-profile flow (new)
    case 'addressInput':
      return <AddressInput />;

    case 'profileLoading':
      return <ProfileLoading />;

    case 'propertyProfile':
      return <PropertyProfileCard />;
    
    default:
      return <SplashScreen />;
  }
}
