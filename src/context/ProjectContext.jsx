import React, { createContext, useContext, useState, useEffect } from 'react'

const ProjectContext = createContext()

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeProject, setActiveProject] = useState(null)
  const [planStatus, setPlanStatus] = useState('free')
  const [appScreen, setAppScreen] = useState('splash')
  const [photos, setPhotos] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate sessionId on mount for temp photo storage before user creation
  useEffect(() => {
    const generateSessionId = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    
    setSessionId(generateSessionId())
  }, [])

  // Session resume logic
  useEffect(() => {
    const resumeSession = async () => {
      try {
        // For now, just show splash screen
        // Session resume will be fully implemented after Supabase client is available
        // TODO: Check for existing auth session (paid users)
        // TODO: Check localStorage for user_id (free users)
        // TODO: Query projects and resume based on status
        setIsLoading(false)
      } catch (error) {
        console.error('Session resume error:', error)
        setIsLoading(false)
      }
    }

    if (sessionId) {
      resumeSession()
    }
  }, [sessionId])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state?.screen) {
        setAppScreen(e.state.screen)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Push to history on screen change
  const navigateToScreen = (screen) => {
    window.history.pushState({ screen }, '')
    setAppScreen(screen)
  }

  const value = {
    // State
    currentUser,
    activeProject,
    planStatus,
    appScreen,
    photos,
    sessionId,
    isLoading,
    
    // Setters
    setCurrentUser,
    setActiveProject,
    setPlanStatus,
    setPhotos,
    
    // Navigation
    navigateToScreen,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}
