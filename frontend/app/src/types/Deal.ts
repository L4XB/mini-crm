import { User } from './User';
import { Contact } from './Contact';
import { Task } from './Task';

export interface Deal {
  id: number;
  title: string;
  description: string;
  value: number;
  status: 'open' | 'won' | 'lost';
  expected_date: string;
  contact_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  user?: User;
  tasks?: Task[];
}

export interface DealFormData {
  title: string;
  description: string;
  value: number;
  status: 'open' | 'won' | 'lost';
  expected_date: string;
  contact_id: number;
}
