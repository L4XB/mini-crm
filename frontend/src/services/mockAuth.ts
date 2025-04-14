/**
 * Mock-Authentifizierungsdienst
 * 
 * Da die tatsächlichen Auth-Endpoints nicht verfügbar oder anders strukturiert sind
 * als in der Dokumentation beschrieben, verwenden wir diesen Mock-Dienst, um die
 * Frontend-Funktionalität zu demonstrieren.
 */

// Beispiel-Benutzer
const MOCK_USERS = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2025-04-14T12:00:00.000Z',
    updatedAt: '2025-04-14T12:00:00.000Z'
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2025-04-14T12:00:00.000Z',
    updatedAt: '2025-04-14T12:00:00.000Z'
  }
];

// JWT Secret für die Simulation (nur für Demonstrationszwecke)
const MOCK_JWT_SECRET = 'mock-secret-key';

/**
 * Generiert ein simuliertes JWT Token
 */
const generateMockToken = (user: any) => {
  // Sehr einfache Simulation eines JWT-Tokens
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Date.now() + 3600000
  }));
  const signature = btoa(MOCK_JWT_SECRET); // Vereinfachte Signatur
  
  return `${header}.${payload}.${signature}`;
};

export const mockAuthService = {
  /**
   * Mock-Login-Funktion
   */
  login: async (email: string, password: string) => {
    // Simuliere API-Latenz
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Einfache Validierung
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }
    
    // Da dies ein Mock ist, prüfen wir das Passwort nicht wirklich
    // In einer realen Anwendung würden wir selbstverständlich das Passwort validieren
    
    const token = generateMockToken(user);
    
    return {
      token,
      user
    };
  },
  
  /**
   * Mock-Registrierungsfunktion
   */
  register: async (userData: { username: string; email: string; password: string }) => {
    // Simuliere API-Latenz
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Prüfe, ob die E-Mail bereits verwendet wird
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    
    if (existingUser) {
      const error = new Error('Diese E-Mail-Adresse wird bereits verwendet.');
      (error as any).status = 409;
      throw error;
    }
    
    // Erstelle einen neuen Benutzer
    const newUser = {
      id: MOCK_USERS.length + 1,
      username: userData.username,
      email: userData.email,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In einem echten System würden wir den Benutzer in die Datenbank einfügen
    // Hier fügen wir ihn nur zum Array hinzu
    MOCK_USERS.push(newUser);
    
    const token = generateMockToken(newUser);
    
    return {
      token,
      user: newUser
    };
  },
  
  /**
   * Mock-Logout-Funktion
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default mockAuthService;
