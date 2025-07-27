import path from 'path';
import { existsSync } from 'fs';

// Returns true if the filePath is inside the baseDir
export function isPathInsideProject(filePath: string, baseDir: string = process.cwd()): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedPath = path.resolve(filePath);
  return resolvedPath.startsWith(resolvedBase + path.sep);
}

// Safe file access example
export function safeReadFile(filePath: string, baseDir: string = process.cwd()): string | null {
  if (!isPathInsideProject(filePath, baseDir)) {
    throw new Error('Access denied: File is outside the project directory.');
  }
  if (!existsSync(filePath)) {
    throw new Error('File does not exist.');
  }
  return require('fs').readFileSync(filePath, 'utf-8');
}
