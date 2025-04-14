import api from './api';

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  relatedTo?: {
    type: 'contact' | 'deal' | 'task' | null;
    id: number | null;
    name: string;
  };
  tags: string[];
  createdBy: string;
}

const notesService = {
  getAll: async (): Promise<Note[]> => {
    try {
      const response = await api.get('/api/v1/notes');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Notizen:', error);
      
      // Fallback auf Mock-Daten, wenn die API nicht erreichbar ist
      return [
        {
          id: 1,
          title: 'Meeting mit ABC GmbH',
          content: 'Besprechung über Software-Implementierung. Kunde wünscht baldmöglichst ein Angebot für die zusätzlichen Module.',
          createdAt: '2025-04-10T09:30:00Z',
          updatedAt: '2025-04-10T10:15:00Z',
          relatedTo: {
            type: 'contact',
            id: 1,
            name: 'Max Mustermann (Musterfirma GmbH)'
          },
          tags: ['Meeting', 'Angebot'],
          createdBy: 'Maria Schmidt'
        },
        {
          id: 2,
          title: 'Folge-Meeting für Wartungsvertrag',
          content: 'XYZ AG ist interessiert an einem jährlichen Wartungsvertrag. Preisvorstellung: 5000€ pro Jahr.',
          createdAt: '2025-04-11T14:00:00Z',
          updatedAt: '2025-04-11T14:30:00Z',
          relatedTo: {
            type: 'deal',
            id: 2,
            name: 'Wartungsvertrag XYZ AG'
          },
          tags: ['Wartung', 'Vertrag'],
          createdBy: 'Thomas Müller'
        },
        {
          id: 3,
          title: 'Anforderungen Cloud Migration',
          content: 'EFG GmbH benötigt: Datenmigration, Schulung für 15 Mitarbeiter, 24/7 Support im ersten Monat.',
          createdAt: '2025-04-12T11:45:00Z',
          updatedAt: '2025-04-12T12:30:00Z',
          relatedTo: {
            type: 'deal',
            id: 3,
            name: 'Cloud Migration für EFG GmbH'
          },
          tags: ['Cloud', 'Anforderungen'],
          createdBy: 'Anna Weber'
        },
        {
          id: 4,
          title: 'Vorbereitung Lösungs-Workshop',
          content: 'Präsentation und Demo für Klinik Gesund vorbereiten. Besonderer Fokus auf Datenschutz und Benutzerschulung.',
          createdAt: '2025-04-13T09:15:00Z',
          updatedAt: '2025-04-13T09:45:00Z',
          relatedTo: {
            type: 'task',
            id: 4,
            name: 'Präsentation für Lösungs-Workshop vorbereiten'
          },
          tags: ['Workshop', 'Präsentation'],
          createdBy: 'Daniel Fischer'
        },
        {
          id: 5,
          title: 'Lizenzierungsoptionen',
          content: 'Recherche zu Lizenzmodellen für TechStart GmbH: Pro Benutzer vs. Pauschal, inkl. Kostenanalyse für beide Varianten.',
          createdAt: '2025-04-09T15:30:00Z',
          updatedAt: '2025-04-09T16:00:00Z',
          relatedTo: {
            type: 'contact',
            id: 5,
            name: 'Michael Klein (Finanzwesen AG)'
          },
          tags: ['Lizenzierung', 'Recherche'],
          createdBy: 'Sabine Wolf'
        },
      ];
    }
  },
  
  getById: async (id: number): Promise<Note> => {
    try {
      const response = await api.get(`/api/v1/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen der Notiz mit ID ${id}:`, error);
      throw error;
    }
  },
  
  create: async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Note> => {
    try {
      const response = await api.post('/api/v1/notes', noteData);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Notiz:', error);
      throw error;
    }
  },
  
  update: async (id: number, noteData: Partial<Note>): Promise<Note> => {
    try {
      const response = await api.put(`/api/v1/notes/${id}`, noteData);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren der Notiz mit ID ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/v1/notes/${id}`);
    } catch (error) {
      console.error(`Fehler beim Löschen der Notiz mit ID ${id}:`, error);
      throw error;
    }
  }
};

export default notesService;
