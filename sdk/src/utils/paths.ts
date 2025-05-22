import path from 'path';
import fs from 'fs-extra';

/**
 * Get the templates directory path
 * @returns Absolute path to the templates directory
 */
export function getTemplatesDir(): string {
  // In development, templates are in the repo
  const devPath = path.resolve(__dirname, '../../templates');
  if (fs.existsSync(devPath)) {
    return devPath;
  }

  // In production (npm package), templates are in the package root
  const prodPath = path.resolve(__dirname, '../templates');
  if (fs.existsSync(prodPath)) {
    return prodPath;
  }

  throw new Error('Templates directory not found');
}

/**
 * Get the package root directory
 * @returns Absolute path to the package root
 */
export function getPackageRoot(): string {
  return path.resolve(__dirname, '../..');
}

/**
 * Get the path to a specific template file
 * @param templateName Name of the template file
 * @returns Absolute path to the template file
 */
export function getTemplatePath(templateName: string): string {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, templateName);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file ${templateName} not found at ${templatePath}`);
  }
  
  return templatePath;
}
