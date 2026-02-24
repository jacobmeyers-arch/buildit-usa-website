/**
 * ProjectDashboard — User project list
 * 
 * Modified: 2026-02-17 — Wired fetchProjects() call (replaced TODO stub)
 */

import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { fetchProjects } from '../lib/api';

export default function ProjectDashboard() {
  const { currentUser, planStatus, setAppScreen, setActiveProject } = useProject();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    if (!currentUser?.id) {
      setError('User not found');
      setIsLoading(false);
      return;
    }
    
    try {
      // Fetch real projects from API (was TODO)
      const result = await fetchProjects(currentUser.id);
      setProjects(result.projects || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Load projects error:', err);
      setError('Failed to load projects');
      setIsLoading(false);
    }
  };
  
  const handleAddProject = async () => {
    if (planStatus === 'free' && projects.length >= 1) {
      setAppScreen('upsell');
      return;
    }
    setActiveProject(null);
    setAppScreen('camera');
  };
  
  const handleProjectClick = (project) => {
    setActiveProject(project);
    if (project.status === 'scoping') {
      setAppScreen('scoping');
    } else if (project.status === 'estimate_ready' || project.status === 'complete') {
      setAppScreen('estimate');
    } else {
      setAppScreen('analysis');
    }
  };
  
  const handleGenerateReport = () => {
    setAppScreen('report');
  };
  
  const formatCostRange = (estimate) => {
    if (!estimate?.line_items) return 'Pending';
    const total = estimate.line_items.reduce((sum, item) => sum + (item.cost_range?.low || 0), 0);
    const totalHigh = estimate.line_items.reduce((sum, item) => sum + (item.cost_range?.high || 0), 0);
    return `$${total.toLocaleString()} - $${totalHigh.toLocaleString()}`;
  };
  
  const getStatusLabel = (status) => {
    const labels = {
      'created': 'Started',
      'analyzing': 'Analyzing',
      'scoping': 'In Progress',
      'estimate_ready': 'Estimate Ready',
      'complete': 'Complete'
    };
    return labels[status] || status;
  };
  
  const canGenerateReport = () => {
    return planStatus === 'paid' && 
           projects.some(p => p.status === 'estimate_ready' || p.status === 'complete');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-iron flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brass"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-iron flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="font-serif text-parchment/80">{error}</p>
          <button
            onClick={loadProjects}
            className="min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-base py-2 px-6 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30">
        <h1 className="font-pencil-hand text-3xl text-parchment">My Projects</h1>
        {planStatus === 'paid' && (
          <p className="font-serif text-brass text-sm mt-1">Whole-House Plan Active</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {canGenerateReport() && (
          <button
            onClick={handleGenerateReport}
            className="w-full min-h-[50px] bg-brass hover:bg-brass/90 text-iron font-pencil-hand text-xl py-3 px-6 rounded-md shadow-lg transition-all"
          >
            Generate My Property Report
          </button>
        )}
        
        <button
          onClick={handleAddProject}
          className="w-full min-h-[50px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-lg py-3 px-6 rounded-md shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span>
          <span>Add New Project</span>
        </button>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="font-serif text-parchment/70">No projects yet</p>
            <p className="font-serif text-parchment/50 text-sm">Tap "Add New Project" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects
              .sort((a, b) => {
                if (a.recommended_sequence && b.recommended_sequence) {
                  return a.recommended_sequence - b.recommended_sequence;
                }
                return new Date(b.created_at) - new Date(a.created_at);
              })
              .map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className="w-full bg-parchment/10 border border-wood/30 hover:border-wood/60 rounded-lg p-5 text-left transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-pencil-hand text-xl text-parchment group-hover:text-brass transition-colors">
                        {project.title || 'Untitled Project'}
                      </h3>
                      <span className="font-serif text-xs text-parchment/60 bg-wood/20 px-2 py-1 rounded whitespace-nowrap">
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    
                    {project.understanding_score !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-iron rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brass transition-all"
                            style={{ width: `${project.understanding_score}%` }}
                          />
                        </div>
                        <span className="font-serif text-xs text-parchment/70 whitespace-nowrap">
                          {project.understanding_score}%
                        </span>
                      </div>
                    )}
                    
                    {project.cost_estimate && (
                      <p className="font-serif text-sm text-brass">
                        {formatCostRange(project.cost_estimate)}
                      </p>
                    )}
                    
                    {project.recommended_sequence && (
                      <p className="font-serif text-xs text-parchment/60 italic">
                        Priority: #{project.recommended_sequence}
                      </p>
                    )}
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
