import { format, formatDistance, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Format a currency value to a localized string with Euro symbol
 * @param value - Number to format as currency
 * @param locale - Locale for formatting (default: de-DE)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, locale = 'de-DE'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a given date into a localized string
 * @param date - Date to format
 * @param formatString - Format string (default: dd.MM.yyyy)
 * @param locale - Locale for formatting (default: de)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  formatString = 'dd.MM.yyyy',
  locale = de
): string => {
  try {
    // If date is a string, try to parse it
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    // Check if date is valid
    if (!isValid(parsedDate)) {
      return 'Ungültiges Datum';
    }
    
    return format(parsedDate, formatString, { locale });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Ungültiges Datum';
  }
};

/**
 * Format a date relative to current time (e.g., "2 days ago")
 * @param date - Date to format
 * @param baseDate - Base date to compare against (default: now)
 * @param locale - Locale for formatting (default: de)
 * @returns Relative time string
 */
export const formatRelativeTime = (
  date: Date | string | number,
  baseDate = new Date(),
  locale = de
): string => {
  try {
    // If date is a string, try to parse it
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    // Check if date is valid
    if (!isValid(parsedDate)) {
      return 'Ungültiges Datum';
    }
    
    return formatDistance(parsedDate, baseDate, {
      addSuffix: true,
      locale,
    });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Ungültiges Datum';
  }
};

/**
 * Format a phone number to a standardized format
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format depending on length and start
  if (cleaned.startsWith('49') && cleaned.length >= 11) {
    // German format: +49 123 45678901
    return cleaned.replace(/(\d{2})(\d{3})(\d{8,})/, '+$1 $2 $3');
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    // US format: +1 (123) 456-7890
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  } else if (cleaned.length === 10) {
    // Generic 10-digit: (123) 456-7890
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else {
    // Just group in blocks of 3-4 digits for readability
    return cleaned.replace(/(\d{2,3})(?=\d)/g, '$1 ');
  }
};

/**
 * Truncate text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength = 50): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Format a file size in bytes to a human-readable string (KB, MB, GB)
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Capitalize the first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format a name (first name and last name) with proper capitalization
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Formatted full name
 */
export const formatName = (firstName: string, lastName: string): string => {
  const formattedFirstName = firstName ? capitalize(firstName.trim()) : '';
  const formattedLastName = lastName ? capitalize(lastName.trim()) : '';
  
  return [formattedFirstName, formattedLastName].filter(Boolean).join(' ');
};
