import { Environment } from '../core/Environment.js';

export class BrowserEnvironment implements Environment {

  // TODO: return data read from query string / cookie / ...

  public getCountry(): string {
    return 'de'
  }

  public getLanguage(): string {
    return 'de'
  }

  public getGithubUsername(): string | undefined {
    return undefined;
  }
}
