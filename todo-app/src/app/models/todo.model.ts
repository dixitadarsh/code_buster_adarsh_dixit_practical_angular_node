export type Priority = 'extreme' | 'moderate' | 'low';
export type Status = 'not-started' | 'in-progress' | 'completed';

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoPayload {
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  tags: string[];
}

export interface UpdateTodoPayload extends Partial<CreateTodoPayload> {
  status?: Status;
}
