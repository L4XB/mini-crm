import { toast, ToastOptions, TypeOptions } from 'react-toastify';

// Schnittstelle für die Benachrichtigungsoptionen
interface NotificationOptions extends ToastOptions {
  logToConsole?: boolean;
}

// Standardoptionen für Benachrichtigungen
const defaultOptions: NotificationOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Service für Benachrichtigungen in der Anwendung
 * Verwendet react-toastify für die Anzeige von Toasts
 */
const notificationService = {
  /**
   * Zeigt eine Informationsbenachrichtigung an
   * @param message Die Nachricht, die angezeigt werden soll
   * @param options Optionen für die Benachrichtigung
   */
  info: (message: string, options?: NotificationOptions) => {
    _showNotification('info', message, options);
  },

  /**
   * Zeigt eine Erfolgsbenachrichtigung an
   * @param message Die Nachricht, die angezeigt werden soll
   * @param options Optionen für die Benachrichtigung
   */
  success: (message: string, options?: NotificationOptions) => {
    _showNotification('success', message, options);
  },

  /**
   * Zeigt eine Warnungsbenachrichtigung an
   * @param message Die Nachricht, die angezeigt werden soll
   * @param options Optionen für die Benachrichtigung
   */
  warning: (message: string, options?: NotificationOptions) => {
    _showNotification('warning', message, options);
  },

  /**
   * Zeigt eine Fehlerbenachrichtigung an
   * @param message Die Nachricht, die angezeigt werden soll
   * @param options Optionen für die Benachrichtigung
   */
  error: (message: string, options?: NotificationOptions) => {
    _showNotification('error', message, options);
  },

  /**
   * Zeigt eine Benachrichtigung beim Laden an (mit Ladeanimation)
   * @param message Die Nachricht, die angezeigt werden soll
   * @param options Optionen für die Benachrichtigung
   * @returns Die ID der Benachrichtigung (zum Aktualisieren/Schließen)
   */
  loading: (message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Aktualisiert eine bestehende Benachrichtigung
   * @param toastId Die ID der zu aktualisierenden Benachrichtigung
   * @param message Die neue Nachricht
   * @param type Der neue Typ der Benachrichtigung
   * @param options Neue Optionen für die Benachrichtigung
   */
  update: (toastId: string | number, message: string, type: TypeOptions, options?: NotificationOptions) => {
    toast.update(toastId, {
      render: message,
      type,
      ...defaultOptions,
      ...options,
      isLoading: false,
    });
  },

  /**
   * Schließt eine Benachrichtigung
   * @param toastId Die ID der zu schließenden Benachrichtigung
   */
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss(); // Schließt alle Benachrichtigungen
    }
  },
};

/**
 * Hilfsfunktion zum Anzeigen einer Benachrichtigung
 * @param type Der Typ der Benachrichtigung
 * @param message Die Nachricht, die angezeigt werden soll
 * @param options Optionen für die Benachrichtigung
 */
function _showNotification(type: TypeOptions, message: string, options?: NotificationOptions) {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Optionale Protokollierung in der Konsole (für Debugging)
  if (mergedOptions.logToConsole) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    delete mergedOptions.logToConsole; // Entferne die Option, bevor sie an toast übergeben wird
  }
  
  toast(message, {
    ...mergedOptions,
    type,
  });
}

export default notificationService;
