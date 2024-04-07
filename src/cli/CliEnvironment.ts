import { Environment } from '../core/Environment.js';
import { CliConfig } from './CliConfig.js';

export class CliEnvironment implements Environment {
  public constructor(private readonly cliConfig: CliConfig) {}

  public getCountry(): string {
    return this.cliConfig.country;
  }

  public getLanguage(): string {
    return this.cliConfig.language;
  }

  public getGithubUsername(): string | undefined {
    return this.cliConfig.githubUsername;
  }
}
