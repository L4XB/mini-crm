'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronDownIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  DocumentTextIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import notesService, { Note } from '@/services/notesService';

// Helper function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

// Helper function to generate avatar color from name
const generateAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 40%)`;
};

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

// Note card component
const NoteCard = ({ note, onEdit, onDelete }: { note: Note; onEdit: (id: number) => void; onDelete: (id: number) => void }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 
            className="text-lg font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
            onClick={() => setExpanded(!expanded)}
          >
            {note.title}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              className="text-gray-400 hover:text-indigo-600"
              onClick={() => onEdit(note.id)}
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Bearbeiten</span>
            </button>
            <button
              className="text-gray-400 hover:text-red-600"
              onClick={() => onDelete(note.id)}
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Löschen</span>
            </button>
          </div>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <ClockIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
          <span>{formatDate(note.updatedAt)}</span>
        </div>
        
        {note.relatedTo && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">
              {note.relatedTo.type === 'contact' ? 'Kontakt: ' : 
               note.relatedTo.type === 'deal' ? 'Deal: ' : 
               note.relatedTo.type === 'task' ? 'Aufgabe: ' : ''}
            </span>
            <span className="text-indigo-600 hover:text-indigo-800">
              {note.relatedTo.name}
            </span>
          </div>
        )}
        
        <div className={`mt-2 ${expanded ? '' : 'line-clamp-2'} text-sm text-gray-700`}>
          {note.content}
        </div>
        
        {!expanded && note.content.length > 150 && (
          <button 
            className="mt-1 text-sm text-indigo-600 hover:text-indigo-800"
            onClick={() => setExpanded(true)}
          >
            Mehr anzeigen
          </button>
        )}
        
        {expanded && (
          <button 
            className="mt-1 text-sm text-indigo-600 hover:text-indigo-800"
            onClick={() => setExpanded(false)}
          >
            Weniger anzeigen
          </button>
        )}
        
        <div className="mt-3 flex items-center">
          <div 
            className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs"
            style={{ backgroundColor: generateAvatarColor(note.createdBy) }}
          >
            {getInitials(note.createdBy)}
          </div>
          <div className="ml-2 text-xs text-gray-500">
            {note.createdBy}
          </div>
        </div>
        
        {note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {note.tags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                <TagIcon className="mr-1 h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Create/Edit Note Modal
const NoteModal = ({ 
  isOpen, 
  onClose, 
  note, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  note?: Note; 
  onSave: (note: Partial<Note>) => void;
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      id: note?.id,
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Schließen</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
              <DocumentTextIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {note ? 'Notiz bearbeiten' : 'Neue Notiz erstellen'}
              </h3>
              
              <form className="mt-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Titel
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Inhalt
                    </label>
                    <textarea
                      id="content"
                      rows={5}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags (durch Komma getrennt)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="z.B. Meeting, Wichtig, Folgen"
                    />
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={onClose}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load notes from API on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const fetchedNotes = await notesService.getAll();
        setNotes(fetchedNotes);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Notizen:', err);
        setError('Notizen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, []);

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));
  
  // Filter notes based on search term and selected tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });
  
  const handleEditNote = (id: number) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setCurrentNote(noteToEdit);
      setNoteModalOpen(true);
    }
  };
  
  const handleDeleteNote = async (id: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Notiz löschen möchten?')) {
      try {
        await notesService.delete(id);
        setNotes(notes.filter(note => note.id !== id));
      } catch (err) {
        console.error('Fehler beim Löschen der Notiz:', err);
        alert('Die Notiz konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.');
      }
    }
  };
  
  const handleCreateNote = () => {
    setCurrentNote(undefined);
    setNoteModalOpen(true);
  };
  
  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (noteData.id) {
        // Update existing note
        const updatedNote = await notesService.update(noteData.id, noteData);
        setNotes(notes.map(note => 
          note.id === noteData.id ? updatedNote : note
        ));
      } else {
        // Create new note
        const newNoteData = {
          title: noteData.title || '',
          content: noteData.content || '',
          tags: noteData.tags || [],
          // In einer echten App würden wir relatedTo hier setzen können
        };
        
        const newNote = await notesService.create(newNoteData);
        setNotes([newNote, ...notes]);
      }
    } catch (err) {
      console.error('Fehler beim Speichern der Notiz:', err);
      alert('Die Notiz konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
    }
  };
  
  const handleExportNotes = () => {
    try {
      // Erstelle CSV-Inhalt
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'ID,Titel,Inhalt,Erstellungsdatum,Tags\n';
      
      filteredNotes.forEach(note => {
        const formattedTags = note.tags.join(';');
        const formattedDate = new Date(note.createdAt).toLocaleDateString('de-DE');
        const escapedContent = `"${note.content.replace(/"/g, '""')}"`;
        const escapedTitle = `"${note.title.replace(/"/g, '""')}"`;
        
        csvContent += `${note.id},${escapedTitle},${escapedContent},${formattedDate},${formattedTags}\n`;
      });
      
      // Erstelle Download-Link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Notizen_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Klicke auf den Link, um den Download zu starten
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Fehler beim Exportieren der Notizen:', err);
      alert('Die Notizen konnten nicht exportiert werden. Bitte versuchen Sie es später erneut.');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notizen</h1>
          <p className="mt-1 text-sm text-gray-500">
            Erfassen und organisieren Sie wichtige Informationen.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleCreateNote}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Neue Notiz
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Notizen durchsuchen..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="mt-3 flex sm:mt-0 sm:ml-4">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FunnelIcon className="mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                Filter: {selectedTag || 'Alle Tags'}
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              </button>
              
              {showFilterMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100">
                      Nach Tag filtern
                    </div>
                    <button
                      className={`${
                        !selectedTag ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } block px-4 py-2 text-sm w-full text-left hover:bg-gray-50`}
                      onClick={() => {
                        setSelectedTag('');
                        setShowFilterMenu(false);
                      }}
                    >
                      Alle Tags
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        className={`${
                          selectedTag === tag ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } block px-4 py-2 text-sm w-full text-left hover:bg-gray-50`}
                        onClick={() => {
                          setSelectedTag(tag);
                          setShowFilterMenu(false);
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleExportNotes}
            >
              <ArrowDownTrayIcon className="mr-2 h-5 w-5 text-gray-500" />
              Exportieren
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Notizen werden geladen...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              <p>{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => window.location.reload()}
              >
                Erneut versuchen
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-10">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Notizen gefunden</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedTag 
                  ? 'Ändern Sie Ihre Suchkriterien, um Ergebnisse zu sehen.' 
                  : 'Erstellen Sie Ihre erste Notiz, um loszulegen.'
                }
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Neue Notiz
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={handleEditNote} 
                  onDelete={handleDeleteNote} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <NoteModal 
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        note={currentNote}
        onSave={handleSaveNote}
      />
    </div>
  );
}
