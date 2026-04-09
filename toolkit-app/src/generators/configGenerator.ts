import * as path from 'path';
import { ProjectConfig, BksConfig } from '../types/project.js';
import { writeJson } from '../utils/fileUtils.js';

export async function generateBksConfig(config: ProjectConfig): Promise<string> {
  const bksConfig: BksConfig = {
    projectName: config.projectName,
    description: config.description,
    techStack: config.techStack,
    createdAt: config.createdAt,
    version: config.version,
    toolkitVersion: '1.0.1',
  };

  const configPath = path.join(config.outputPath, '.bks-config.json');
  await writeJson(configPath, bksConfig);
  return configPath;
}
