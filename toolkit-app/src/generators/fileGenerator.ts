import * as path from 'path';
import { ProjectConfig } from '../types/project.js';
import {
  copyFile,
  copyDirectory,
  createDirectory,
  exists,
} from '../utils/fileUtils.js';

/**
 * Arquivos da Constituição (CLAUDE*) copiados para specs/
 * Fonte: toolkit-app/docs/
 */
const CLAUDE_FILES = [
  'CLAUDE.md',
  'CLAUDE-TDD.md',
  'PLAN.md',
  'VERSIONING.md',
];

/**
 * Arquivos CLAUDE* específicos por tech stack
 */
const STACK_SPECIFIC_FILES: Record<string, string[]> = {
  net: [],
  python: [],
  java: [],
};

export async function generateProjectFiles(
  config: ProjectConfig
): Promise<string[]> {
  const filesCreated: string[] = [];
  const { outputPath, toolkitPath, techStack } = config;

  // 1. Criar estrutura de pastas
  const dirs = [
    path.join(outputPath, 'specs'),
    path.join(outputPath, 'specs', 'features'),
    path.join(outputPath, 'specs', 'templates'),
    path.join(outputPath, 'src'),
    path.join(outputPath, 'tests'),
  ];

  for (const dir of dirs) {
    await createDirectory(dir);
    filesCreated.push(dir);
  }

  // 2. Copiar arquivos CLAUDE* genéricos para specs/
  for (const file of CLAUDE_FILES) {
    const src = path.join(toolkitPath, file);
    const dest = path.join(outputPath, 'specs', file);
    if (exists(src)) {
      await copyFile(src, dest);
      filesCreated.push(dest);
    }
  }

  // 3. Copiar arquivos CLAUDE* específicos do stack
  const stackFiles = STACK_SPECIFIC_FILES[techStack] ?? [];
  for (const file of stackFiles) {
    const src = path.join(toolkitPath, file);
    const dest = path.join(outputPath, 'specs', file);
    if (exists(src)) {
      await copyFile(src, dest);
      filesCreated.push(dest);
    }
  }

  // 4. Copiar templates agnósticos
  const templatesAgnosticSrc = path.join(toolkitPath, 'templates');
  const templatesAgnosticDest = path.join(outputPath, 'specs', 'templates');
  if (exists(templatesAgnosticSrc)) {
    // Copiar apenas arquivos da raiz de templates (não subpastas de outros stacks)
    const templateFiles = [
      'requirements-template.md',
      'design-template.md',
      'tasks-template.md',
      'tests-template.md',
    ];
    for (const file of templateFiles) {
      const src = path.join(templatesAgnosticSrc, file);
      const dest = path.join(templatesAgnosticDest, file);
      if (exists(src)) {
        await copyFile(src, dest);
        filesCreated.push(dest);
      }
    }
  }

  // 5. Copiar templates específicos do stack (ex: templates/net/)
  const stackTemplatesSrc = path.join(toolkitPath, 'templates', techStack);
  const stackTemplatesDest = path.join(outputPath, 'specs', 'templates', techStack);
  if (exists(stackTemplatesSrc)) {
    await copyDirectory(stackTemplatesSrc, stackTemplatesDest);
    filesCreated.push(stackTemplatesDest);
  }

  // 6. Copiar guidelines/ para specs/guidelines/
  const guidelinesSrc = path.join(toolkitPath, 'guidelines');
  const guidelinesDest = path.join(outputPath, 'specs', 'guidelines');
  if (exists(guidelinesSrc)) {
    await createDirectory(guidelinesDest);
    await copyDirectory(guidelinesSrc, guidelinesDest);
    filesCreated.push(guidelinesDest);
  }

  // 7. Criar .gitkeep nas pastas de features e src (manter no git)
  const gitkeepDirs = [
    path.join(outputPath, 'specs', 'features', '.gitkeep'),
    path.join(outputPath, 'src', '.gitkeep'),
    path.join(outputPath, 'tests', '.gitkeep'),
  ];
  for (const gitkeep of gitkeepDirs) {
    const { writeFile } = await import('../utils/fileUtils.js');
    await writeFile(gitkeep, '');
    filesCreated.push(gitkeep);
  }

  return filesCreated;
}
