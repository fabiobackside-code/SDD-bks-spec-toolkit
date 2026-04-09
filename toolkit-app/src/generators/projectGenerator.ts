import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs-extra';
import { ProjectConfig, GenerationResult } from '../types/project.js';
import { generateProjectFiles } from './fileGenerator.js';
import { generateBksConfig } from './configGenerator.js';
import { writeFile } from '../utils/fileUtils.js';
import { resolveToolkitPath } from '../utils/pathUtils.js';

export async function generateProject(config: ProjectConfig): Promise<GenerationResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Gerar arquivos de spec e templates
    const specFiles = await generateProjectFiles(config);
    filesCreated.push(...specFiles);

    // 2. Gerar .bks-config.json
    const configFile = await generateBksConfig(config);
    filesCreated.push(configFile);

    // 3. Gerar CONTINUIDADE.md via EJS template
    const continuityFile = await generateContinuityFile(config);
    filesCreated.push(continuityFile);

    // 4. Gerar .gitignore básico
    const gitignoreFile = await generateGitignore(config);
    filesCreated.push(gitignoreFile);

    return {
      success: true,
      outputPath: config.outputPath,
      filesCreated,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    return {
      success: false,
      outputPath: config.outputPath,
      filesCreated,
      errors,
    };
  }
}

async function generateContinuityFile(config: ProjectConfig): Promise<string> {
  const templatePath = path.join(__dirname, '..', 'templates', 'continuity.ejs');
  const rendered = await ejs.renderFile(templatePath, {
    projectName: config.projectName,
    description: config.description,
    techStack: config.techStack,
    techLabel: config.techStack === 'net' ? '.NET 8+ (C#)' : config.techStack,
    createdAt: config.createdAt,
  });

  const destPath = path.join(config.outputPath, 'CONTINUIDADE.md');
  await writeFile(destPath, rendered);
  return destPath;
}

async function generateGitignore(config: ProjectConfig): Promise<string> {
  const content = [
    '# Dependencies',
    'node_modules/',
    '',
    '# Build',
    'bin/',
    'obj/',
    'dist/',
    '',
    '# Environment',
    '.env',
    '.env.local',
    '',
    '# IDE',
    '.vs/',
    '.vscode/',
    '.idea/',
    '',
    '# OS',
    '.DS_Store',
    'Thumbs.db',
    '',
    '# Logs',
    'logs/',
    '*.log',
    '',
    '# Coverage',
    'coverage/',
    'TestResults/',
  ].join('\n');

  const destPath = path.join(config.outputPath, '.gitignore');
  await writeFile(destPath, content);
  return destPath;
}
