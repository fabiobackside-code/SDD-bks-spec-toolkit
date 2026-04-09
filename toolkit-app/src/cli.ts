import chalk from 'chalk';
import * as path from 'path';
import { askProjectQuestions } from './prompts.js';
import { generateProject } from './generators/projectGenerator.js';
import { resolveToolkitPath, resolveOutputPath } from './utils/pathUtils.js';
import { validateToolkitPath } from './utils/validation.js';
import { ProjectConfig } from './types/project.js';

const TOOLKIT_VERSION = '1.0.1';

export async function runCreate(): Promise<void> {
  printHeader();

  // 1. Verificar bks-spec-toolkit
  const toolkitPath = resolveToolkitPath();
  const toolkitValid = validateToolkitPath(toolkitPath);
  if (toolkitValid !== true) {
    console.error(chalk.red(`\n❌ Erro: ${toolkitValid}`));
    console.error(chalk.yellow(`   Esperado em: ${toolkitPath}`));
    process.exit(1);
  }

  console.log(chalk.dim(`   📚 Toolkit encontrado: ${toolkitPath}\n`));

  // 2. Coletar informações do usuário
  const answers = await askProjectQuestions();

  if (!answers.confirm) {
    console.log(chalk.yellow('\n⚠️  Criação cancelada pelo usuário.\n'));
    return;
  }

  // 3. Montar configuração
  const outputPath = resolveOutputPath(answers.outputPath, answers.projectName);
  const config: ProjectConfig = {
    projectName: answers.projectName,
    description: answers.description,
    techStack: answers.techStack,
    outputPath,
    toolkitPath,
    createdAt: new Date().toISOString().split('T')[0],
    version: TOOLKIT_VERSION,
  };

  // 4. Executar geração
  console.log(chalk.cyan('\n🔧 Gerando projeto...\n'));
  const result = await generateProject(config);

  // 5. Exibir resultado
  if (result.success) {
    printSuccess(config, result.filesCreated);
  } else {
    printError(result.errors ?? []);
  }
}

function printHeader(): void {
  console.log('\n' + chalk.blue('╔═══════════════════════════════════════╗'));
  console.log(chalk.blue('║') + chalk.bold.white('   🚀 bks-spec-toolkit CLI v1.0.1      ') + chalk.blue('║'));
  console.log(chalk.blue('║') + chalk.dim('   Spec-Driven Development Scaffold    ') + chalk.blue('║'));
  console.log(chalk.blue('╚═══════════════════════════════════════╝') + '\n');
}

function printSuccess(config: ProjectConfig, filesCreated: string[]): void {
  console.log(chalk.green('\n✅ Projeto criado com sucesso!\n'));
  console.log(chalk.white('📁 Local:    ') + chalk.cyan(config.outputPath));
  console.log(chalk.white('📦 Projeto:  ') + chalk.cyan(config.projectName));
  console.log(chalk.white('🛠️  Stack:    ') + chalk.cyan(config.techStack.toUpperCase()));
  console.log(chalk.white('📄 Arquivos: ') + chalk.cyan(`${filesCreated.length} criados`));

  console.log(chalk.yellow('\n' + '─'.repeat(45)));
  console.log(chalk.bold.white('📚 Próximos Passos:\n'));
  console.log(chalk.white('  1. ') + chalk.cyan(`cd ${config.outputPath}`));
  console.log(chalk.white('  2. ') + chalk.cyan('cat CONTINUIDADE.md') + chalk.dim('  ← Leia primeiro!'));
  console.log(chalk.white('  3. ') + chalk.cyan('cat specs/CLAUDE.md') + chalk.dim('  ← Princípios SDD'));
  console.log(chalk.white('  4. ') + chalk.cyan('cat specs/PLAN.md') + chalk.dim('    ← As 5 fases'));
  console.log(chalk.white('  5. ') + chalk.cyan('mkdir specs/features/[nome-feature]'));
  console.log(chalk.white('  6. ') + chalk.dim('Preencha requirements.md da feature'));
  console.log(chalk.yellow('─'.repeat(45) + '\n'));
}

function printError(errors: string[]): void {
  console.log(chalk.red('\n❌ Erro na geração do projeto:\n'));
  errors.forEach(err => {
    console.log(chalk.red(`   • ${err}`));
  });
  console.log(chalk.yellow('\n   Tente novamente ou reporte o problema.\n'));
}
