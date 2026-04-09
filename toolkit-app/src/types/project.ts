export type TechStack = 'net' | 'python' | 'java';

export interface ProjectAnswers {
  projectName: string;
  description: string;
  techStack: TechStack;
  outputPath: string;
  confirm: boolean;
}

export interface ProjectConfig {
  projectName: string;
  description: string;
  techStack: TechStack;
  outputPath: string;
  toolkitPath: string;
  createdAt: string;
  version: string;
}

export interface BksConfig {
  projectName: string;
  description: string;
  techStack: TechStack;
  createdAt: string;
  version: string;
  toolkitVersion: string;
}

export interface GenerationResult {
  success: boolean;
  outputPath: string;
  filesCreated: string[];
  errors?: string[];
}

export const TECH_STACK_LABELS: Record<TechStack, string> = {
  net: '.NET 8+ (C#)',
  python: 'Python 3.11+ (FastAPI) — Em breve',
  java: 'Java 17+ (Spring Boot) — Em breve',
};

export const SUPPORTED_STACKS: TechStack[] = ['net'];
