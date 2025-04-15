import { User } from './User';
import { Deal } from './Deal';

export interface Task {
  id: number;
  title: string;
  details: string;
  due_date: string;
  completed: boolean;
  deal_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  deal?: Deal;
  user?: User;
}

export interface TaskFormData {
  title: string;
  details: string;
  due_date: string;
  deal_id?: number;
}
