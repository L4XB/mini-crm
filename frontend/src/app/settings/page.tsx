'use client';

import { useState } from 'react';
import {
  UserIcon,
  BellIcon,
  Cog6ToothIcon,
  UsersIcon,
  KeyIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface TabDefinition {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const tabs: TabDefinition[] = [
  { id: 'profile', name: 'Profil', icon: <UserIcon className="h-5 w-5" /> },
  { id: 'notifications', name: 'Benachrichtigungen', icon: <BellIcon className="h-5 w-5" /> },
  { id: 'general', name: 'Allgemein', icon: <Cog6ToothIcon className="h-5 w-5" /> },
  { id: 'team', name: 'Team', icon: <UsersIcon className="h-5 w-5" /> },
  { id: 'api', name: 'API-Schlüssel', icon: <KeyIcon className="h-5 w-5" /> },
];

// Basis-Komponente für Einstellungsformulare
const SettingsForm = ({ 
  children, 
  title, 
  description
}: { 
  children: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white shadow sm:rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      <div className="mt-2 max-w-xl text-sm text-gray-500">
        <p>{description}</p>
      </div>
      <div className="mt-5">
        {children}
      </div>
    </div>
  </div>
);

export default function SettingsPage() {
  const [currentTab, setCurrentTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveSettings = (formData: any) => {
    setIsSaving(true);
    
    // In einer echten Anwendung würden wir hier einen API-Aufruf machen
    console.log('Speichere Einstellungen:', formData);
    
    // Simuliere API-Verzögerung
    setTimeout(() => {
      setIsSaving(false);
      // Zeige Erfolgsbenachrichtigung
      alert('Einstellungen gespeichert!');
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-1 text-sm text-gray-500">
          Verwalten Sie Ihre persönlichen und Systemeinstellungen.
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="sm:hidden">
          <select
            id="tabs"
            name="tabs"
            className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            defaultValue={currentTab}
            onChange={(e) => setCurrentTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`
                    ${currentTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="p-6">
          {/* Profilseite */}
          {currentTab === 'profile' && (
            <div className="space-y-6">
              <SettingsForm 
                title="Persönliche Informationen" 
                description="Aktualisieren Sie Ihre persönlichen Daten."
              >
                <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                      Vorname
                    </label>
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      defaultValue="Max"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                      Nachname
                    </label>
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      defaultValue="Mustermann"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue="max.mustermann@example.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isSaving}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveSettings({
                          firstName: (document.getElementById('first-name') as HTMLInputElement).value,
                          lastName: (document.getElementById('last-name') as HTMLInputElement).value,
                          email: (document.getElementById('email') as HTMLInputElement).value,
                        });
                      }}
                    >
                      {isSaving ? (
                        <>
                          <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Speichern...
                        </>
                      ) : (
                        'Speichern'
                      )}
                    </button>
                  </div>
                </form>
              </SettingsForm>

              <SettingsForm 
                title="Passwort ändern" 
                description="Stellen Sie sicher, dass Ihr Konto ein sicheres Passwort verwendet."
              >
                <form className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                      Aktuelles Passwort
                    </label>
                    <input
                      type="password"
                      name="current-password"
                      id="current-password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      Neues Passwort
                    </label>
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      Passwort bestätigen
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveSettings({
                          currentPassword: (document.getElementById('current-password') as HTMLInputElement).value,
                          newPassword: (document.getElementById('new-password') as HTMLInputElement).value,
                          confirmPassword: (document.getElementById('confirm-password') as HTMLInputElement).value,
                        });
                      }}
                    >
                      Passwort aktualisieren
                    </button>
                  </div>
                </form>
              </SettingsForm>
            </div>
          )}

          {/* Benachrichtigungseinstellungen */}
          {currentTab === 'notifications' && (
            <SettingsForm 
              title="Benachrichtigungseinstellungen" 
              description="Legen Sie fest, wann und wie Sie benachrichtigt werden möchten."
            >
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email_notifications"
                      name="email_notifications"
                      type="checkbox"
                      defaultChecked={true}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email_notifications" className="font-medium text-gray-700">
                      E-Mail-Benachrichtigungen
                    </label>
                    <p className="text-gray-500">Erhalten Sie Benachrichtigungen per E-Mail.</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="browser_notifications"
                      name="browser_notifications"
                      type="checkbox"
                      defaultChecked={true}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="browser_notifications" className="font-medium text-gray-700">
                      Browser-Benachrichtigungen
                    </label>
                    <p className="text-gray-500">Erhalten Sie Benachrichtigungen in Ihrem Browser.</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="task_notifications"
                      name="task_notifications"
                      type="checkbox"
                      defaultChecked={true}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="task_notifications" className="font-medium text-gray-700">
                      Aufgaben-Erinnerungen
                    </label>
                    <p className="text-gray-500">Benachrichtigungen für anstehende und überfällige Aufgaben.</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="deal_notifications"
                      name="deal_notifications"
                      type="checkbox"
                      defaultChecked={true}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="deal_notifications" className="font-medium text-gray-700">
                      Deal-Updates
                    </label>
                    <p className="text-gray-500">Benachrichtigungen für Änderungen an Deals.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => handleSaveSettings({
                      emailNotifications: (document.getElementById('email_notifications') as HTMLInputElement).checked,
                      browserNotifications: (document.getElementById('browser_notifications') as HTMLInputElement).checked,
                      taskNotifications: (document.getElementById('task_notifications') as HTMLInputElement).checked,
                      dealNotifications: (document.getElementById('deal_notifications') as HTMLInputElement).checked,
                    })}
                  >
                    Einstellungen speichern
                  </button>
                </div>
              </div>
            </SettingsForm>
          )}

          {/* Allgemeine Einstellungen */}
          {currentTab === 'general' && (
            <div className="space-y-6">
              <SettingsForm 
                title="Spracheinstellungen" 
                description="Legen Sie die Sprache und Formate für die Anwendung fest."
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                      Sprache
                    </label>
                    <select
                      id="language"
                      name="language"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      defaultValue="de"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">Englisch</option>
                      <option value="fr">Französisch</option>
                      <option value="es">Spanisch</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date_format" className="block text-sm font-medium text-gray-700">
                      Datumsformat
                    </label>
                    <select
                      id="date_format"
                      name="date_format"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      defaultValue="dd.mm.yyyy"
                    >
                      <option value="dd.mm.yyyy">DD.MM.YYYY</option>
                      <option value="mm.dd.yyyy">MM.DD.YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => handleSaveSettings({
                        language: (document.getElementById('language') as HTMLSelectElement).value,
                        dateFormat: (document.getElementById('date_format') as HTMLSelectElement).value,
                      })}
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </SettingsForm>

              <SettingsForm 
                title="Export" 
                description="Exportieren Sie Ihre Daten in verschiedenen Formaten."
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="export_type" className="block text-sm font-medium text-gray-700">
                      Export-Format
                    </label>
                    <select
                      id="export_type"
                      name="export_type"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      defaultValue="csv"
                    >
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => alert('Export-Funktion wird implementiert')}
                    >
                      Daten exportieren
                    </button>
                  </div>
                </div>
              </SettingsForm>
            </div>
          )}

          {/* Team-Einstellungen */}
          {currentTab === 'team' && (
            <SettingsForm 
              title="Team-Verwaltung" 
              description="Verwalten Sie Benutzer und Berechtigungen."
            >
              <div className="space-y-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {[
                      { id: 1, name: 'Max Mustermann', email: 'max.mustermann@example.com', role: 'Administrator' },
                      { id: 2, name: 'Maria Schmidt', email: 'maria.schmidt@example.com', role: 'Manager' },
                      { id: 3, name: 'Thomas Müller', email: 'thomas.mueller@example.com', role: 'Benutzer' },
                    ].map((user) => (
                      <li key={user.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-800 font-medium text-sm">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            <div className="flex">
                              <select
                                className="mr-2 block text-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                defaultValue={user.role.toLowerCase()}
                              >
                                <option value="administrator">Administrator</option>
                                <option value="manager">Manager</option>
                                <option value="benutzer">Benutzer</option>
                              </select>
                              <button 
                                className="text-sm text-red-600 hover:text-red-900"
                                onClick={() => alert('Benutzer entfernen')}
                              >
                                Entfernen
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => alert('Benutzer hinzufügen')}
                  >
                    Benutzer hinzufügen
                  </button>
                </div>
              </div>
            </SettingsForm>
          )}

          {/* API-Schlüssel */}
          {currentTab === 'api' && (
            <SettingsForm 
              title="API-Schlüssel" 
              description="Verwalten Sie API-Schlüssel für Integrationen mit anderen Systemen."
            >
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Aktueller API-Schlüssel</div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      readOnly
                      value="••••••••••••••••••••••••••••••"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => alert('API-Schlüssel anzeigen')}
                    >
                      Anzeigen
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => alert('Neuen API-Schlüssel generieren')}
                  >
                    Neuen Schlüssel generieren
                  </button>
                </div>
              </div>
            </SettingsForm>
          )}
        </div>
      </div>
    </div>
  );
}
