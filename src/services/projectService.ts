import { Project } from '../types';
import { get, set } from 'idb-keyval';

const STORAGE_KEY = 'siemens_lv_projects';

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const projects = await get<Project[]>(STORAGE_KEY);
      return projects || [];
    } catch (e) {
      console.error('Failed to get projects from IndexedDB', e);
      return [];
    }
  },

  saveProject: async (project: Project): Promise<void> => {
    const projects = await projectService.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    let updatedProjects: Project[];
    if (index >= 0) {
      updatedProjects = [...projects];
      updatedProjects[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updatedProjects = [
        ...projects,
        {
          ...project,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    try {
      await set(STORAGE_KEY, updatedProjects);
    } catch (e) {
      console.error('Failed to save projects to IndexedDB', e);
      throw e;
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    const projects = await projectService.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    try {
      await set(STORAGE_KEY, filtered);
    } catch (e) {
      console.error('Failed to delete project from IndexedDB', e);
      throw e;
    }
  }
};
