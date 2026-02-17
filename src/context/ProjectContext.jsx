import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [planStatus, setPlanStatus] = useState('free');
  const [appScreen, setAppScreen] = useState('splash');
  const [photos, setPhotos] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // Generate sessionId on mount
  useEffect(() => {
    const sid = crypto.randomUUID();
    setSessionId(sid);
  }, []);

  // Session resume: check localStorage for user_id
  useEffect(() => {
    const resumeSession = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!error && projects && projects.length > 0) {
            setActiveProject(projects[0]);
            setCurrentUser({ id: userId });
            // Determine plan status from project
            if (projects[0].plan_type === 'paid') {
              setPlanStatus('paid');
            }
          }
        } catch (err) {
          console.error('Session resume failed:', err);
        }
      }
    };

    resumeSession();
  }, []);

  // History pushState on screen transitions
  useEffect(() => {
    if (appScreen !== 'splash') {
      window.history.pushState({ screen: appScreen }, '', `#${appScreen}`);
    }
  }, [appScreen]);

  // Popstate listener for back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setAppScreen(event.state.screen);
      } else {
        setAppScreen('splash');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    activeProject,
    setActiveProject,
    planStatus,
    setPlanStatus,
    appScreen,
    setAppScreen,
    photos,
    setPhotos,
    sessionId,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
