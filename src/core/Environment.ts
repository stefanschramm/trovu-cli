import { Shortcut } from './database/Shortcut.js';

export interface Environment {
  getCountry(): string;
  getLanguage(): string;
  /**
   * Namespaces in ascending priority (lowest first)
   */
  getNamespaces(): NamespaceSource[];
}

export type NamespaceSource = {
  name?: string;
} & (
  | OfficialNamespaceSource
  | UrlNamespaceSource
  | GithubNamespaceSource
  | FileNamespaceSource
  | StaticNamespaceSource
);

type OfficialNamespaceSource = string;

type UrlNamespaceSource = {
  readonly url?: string;
};

type GithubNamespaceSource = {
  readonly github?: string;
};

/** Special type for trovu-cli only */
type FileNamespaceSource = {
  file: ShortcutSearchKeyMap;
};

type StaticNamespaceSource = {
  shortcuts: ShortcutSearchKeyMap;
};

type ShortcutSearchKeyMap = Record<string, Shortcut>;

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
