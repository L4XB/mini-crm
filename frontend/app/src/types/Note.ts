import { User } from './User';
import { Contact } from './Contact';

export interface Note {
  id: number;
  content: string;
  contact_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  user?: User;
}

export interface NoteFormData {
  content: string;
  contact_id: number;
}
