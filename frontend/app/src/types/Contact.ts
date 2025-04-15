import { User } from './User';
import { Note } from './Note';
import { Deal } from './Deal';

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  contact_stage: 'Lead' | 'Customer' | 'Prospect';
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  notes?: Note[];
  deals?: Deal[];
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  contact_stage: 'Lead' | 'Customer' | 'Prospect';
}
