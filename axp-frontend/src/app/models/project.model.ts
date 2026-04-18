export interface Project {
  id: number;
  name: string;
  description: string | null;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}
