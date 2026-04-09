import inquirer from 'inquirer';
import * as path from 'path';
import { ProjectAnswers, TechStack, TECH_STACK_LABELS } from './types/project.js';
import { validateProjectName, validateOutputPath } from './utils/validation.js';

export async function askProjectQuestions(): Promise<ProjectAnswers> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '📦 Nome do projeto:',
      validate: validateProjectName,
      filter: (input: string) => input.trim().toLowerCase().replace(/\s+/g, '-'),
    },
    {
      type: 'input',
      name: 'description',
      message: '📝 Descrição do projeto (opcional):',
      default: '',
      filter: (input: string) => input.trim(),
    },
    {
      type: 'list',
      name: 'techStack',
      message: '🛠️  Tech Stack:',
      choices: [
        {
          name: TECH_STACK_LABELS['net'],
          value: 'net' as TechStack,
        },
        {
          name: TECH_STACK_LABELS['python'],
          value: 'python' as TechStack,
          disabled: 'Em breve',
        },
        {
          name: TECH_STACK_LABELS['java'],
          value: 'java' as TechStack,
          disabled: 'Em breve',
        },
      ],
      default: 'net',
    },
    {
      type: 'input',
      name: 'outputPath',
      message: '📁 Onde criar o projeto?',
      default: (ans: Partial<ProjectAnswers>) =>
        path.join(process.cwd(), ans.projectName ?? 'my-project'),
      validate: validateOutputPath,
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (ans: Partial<ProjectAnswers>) =>
        `\n✅ Confirma a criação do projeto "${ans.projectName}" (${ans.techStack?.toUpperCase()}) em:\n   ${ans.outputPath}\n`,
      default: true,
    },
  ]);

  return answers as ProjectAnswers;
}
