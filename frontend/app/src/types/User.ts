export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  settings?: Settings;
}

export interface Settings {
  id: number;
  user_id: number;
  theme: 'light' | 'dark' | string;
  language: 'de' | 'en' | string;
  created_at: string;
  updated_at: string;
}
