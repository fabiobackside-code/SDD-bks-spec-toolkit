import * as fs from 'fs-extra';
import * as path from 'path';

export function validateProjectName(name: string): true | string {
  if (!name || name.trim().length === 0) {
    return 'O nome do projeto não pode ser vazio.';
  }
  if (!/^[a-zA-Z0-9-_.]+$/.test(name)) {
    return 'Use apenas letras, números, hífens, underscores ou pontos.';
  }
  if (name.length < 2) {
    return 'O nome deve ter no mínimo 2 caracteres.';
  }
  if (name.length > 64) {
    return 'O nome deve ter no máximo 64 caracteres.';
  }
  return true;
}

export function validateOutputPath(outputPath: string): true | string {
  if (!outputPath || outputPath.trim().length === 0) {
    return 'O caminho não pode ser vazio.';
  }
  const resolved = path.resolve(outputPath);
  if (fs.existsSync(resolved)) {
    return `O diretório "${resolved}" já existe. Escolha um caminho diferente.`;
  }
  return true;
}

export function validateToolkitPath(toolkitPath: string): true | string {
  if (!fs.existsSync(toolkitPath)) {
    return `Pasta docs/ não encontrada em: ${toolkitPath}`;
  }
  const requiredFiles = ['CLAUDE.md', 'PLAN.md'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(toolkitPath, file))) {
      return `Arquivo obrigatório não encontrado: ${file}`;
    }
  }
  return true;
}
