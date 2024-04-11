import { RawShortcut } from './database/Shortcut.js';

export interface Environment {
  getCountry(): string;
  getLanguage(): string;
  /**
   * Namespaces in ascending priority (lowest first)
   */
  getNamespaces(): NamespaceSource[];
}

export type NamespaceSource = OfficialNamespaceSource | ComplexNamespaceSource;

type OfficialNamespaceSource = string;

type ComplexNamespaceSource = {
  readonly name?: string;
  readonly url?: string;
  readonly github?: string;
  readonly file?: string;
  readonly shortcuts?: ShortcutSearchKeyMap;
};

export type ShortcutSearchKeyMap = Record<string, RawShortcut>;

/**
 * Common Environment dummy for unit tests
 */
export class EnvironmentDummy implements Environment {
  public getNamespaces(): NamespaceSource[] {
    return ['o', 'de', '.de'];
  }

  public getCountry(): string {
    return 'de';
  }

  public getLanguage(): string {
    return 'de';
  }
}
