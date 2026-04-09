import * as path from 'path';
import * as fs from 'fs-extra';

/**
 * Resolve o caminho da pasta docs/ dentro do toolkit-app.
 * Estrutura: toolkit-app/dist/utils/__dirname → toolkit-app/docs/
 * __dirname em runtime = dist/utils/
 */
export function resolveToolkitPath(): string {
  // dist/utils/../../ = toolkit-app/
  const toolkitAppDir = path.resolve(__dirname, '..', '..');
  return path.resolve(toolkitAppDir, 'docs');
}

export function resolveOutputPath(outputPath: string, projectName: string): string {
  if (path.isAbsolute(outputPath)) {
    return outputPath;
  }
  return path.resolve(process.cwd(), outputPath || projectName);
}

export function getTemplatesPath(toolkitPath: string): string {
  return path.join(toolkitPath, 'templates');
}

export function getNetTemplatesPath(toolkitPath: string): string {
  return path.join(toolkitPath, 'templates', 'net');
}

export function getSamplesPath(toolkitPath: string): string {
  return path.join(toolkitPath, 'samples');
}

export function checkPathExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
