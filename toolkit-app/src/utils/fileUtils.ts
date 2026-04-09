import * as fs from 'fs-extra';
import * as path from 'path';

export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.ensureDir(dest);
  await fs.copy(src, dest, { overwrite: false });
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function createDirectory(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function writeJson(filePath: string, data: object): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2 });
}

export async function listFiles(dirPath: string): Promise<string[]> {
  if (!fs.existsSync(dirPath)) return [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.map(e => e.name);
}

export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
