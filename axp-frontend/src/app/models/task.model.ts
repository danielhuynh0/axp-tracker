export interface Task {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
}

export interface TaskCreate {
  name: string;
  description?: string;
}

export interface TaskCategoryWeight {
  category_id: number;
  category_name: string;
  weight: number;
}
