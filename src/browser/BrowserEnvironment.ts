import { Environment, NamespaceSource } from '../core/Environment.js';

export class BrowserEnvironment implements Environment {

  // TODO: return data read from query string / cookie / ...

  public getNamespaces(): NamespaceSource[] {
    return [
      'o',
      'de',
      '.de',
    ];
  }

  public getCountry(): string {
    return 'de';
  }

  public getLanguage(): string {
    return 'de';
  }
}
