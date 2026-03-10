import { Project } from '../types';

const STORAGE_KEY = 'siemens_lv_projects';

export const projectService = {
  getProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse projects from localStorage', e);
      return [];
    }
  },

  saveProject: (project: Project): void => {
    const projects = projectService.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.push({
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },

  deleteProject: (id: string): void => {
    const projects = projectService.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
