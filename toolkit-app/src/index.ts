#!/usr/bin/env node

import { Command } from 'commander';
import { runCreate } from './cli.js';

const program = new Command();

program
  .name('bks-create')
  .description('CLI para criação de projetos baseados no bks-spec-toolkit (SDD)')
  .version('1.0.1');

program
  .command('create')
  .description('Criar um novo projeto SDD com estrutura completa')
  .action(async () => {
    await runCreate();
  });

// Comando padrão: se não passar subcommand, executa create
program
  .action(async () => {
    await runCreate();
  });

program.parse(process.argv);
