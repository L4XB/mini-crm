export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  contactStage: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lastContactedAt?: string;
  assignedTo?: string;
  tags?: string[];
}
