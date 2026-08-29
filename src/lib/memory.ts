export type ProjectStatus = 'draft' | 'applied' | 'interviewing' | 'rejected' | 'offer';

export interface ProjectNote {
  id: string;
  content: string;
  createdAt: string;
  isAIGenerated?: boolean;
}

export interface JobProject {
  id: string;
  title: string;
  company: string;
  status: ProjectStatus;
  notes: ProjectNote[];
  jobUrl?: string;
  updatedAt: string;
  createdAt: string;
}

const STORAGE_KEY = 'job_projects_memory';

export const ProjectMemory = {
  getProjects: (): JobProject[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load projects from localStorage", error);
      return [];
    }
  },

  getProject: (id: string): JobProject | undefined => {
    const projects = ProjectMemory.getProjects();
    return projects.find(p => p.id === id);
  },

  saveProject: (project: JobProject): JobProject => {
    try {
      const projects = ProjectMemory.getProjects();
      const index = projects.findIndex(p => p.id === project.id);
      
      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.push(project);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return project;
    } catch (error) {
      console.warn("Failed to save project to localStorage", error);
      return project;
    }
  },

  updateStatus: (id: string, status: ProjectStatus): JobProject | undefined => {
    const project = ProjectMemory.getProject(id);
    if (project) {
      project.status = status;
      project.updatedAt = new Date().toISOString();
      return ProjectMemory.saveProject(project);
    }
    return undefined;
  },

  addNote: (id: string, content: string, isAIGenerated = false): JobProject | undefined => {
    const project = ProjectMemory.getProject(id);
    if (project) {
      const newNote: ProjectNote = {
        id: 'note_' + Date.now(),
        content,
        isAIGenerated,
        createdAt: new Date().toISOString()
      };
      project.notes = [...(project.notes || []), newNote];
      project.updatedAt = new Date().toISOString();
      return ProjectMemory.saveProject(project);
    }
    return undefined;
  },

  deleteProject: (id: string): boolean => {
    try {
      const projects = ProjectMemory.getProjects();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.warn("Failed to delete project from localStorage", error);
      return false;
    }
  }
};
