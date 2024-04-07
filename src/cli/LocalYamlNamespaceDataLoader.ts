import fs from 'fs';
import { YamlNamespaceDataLoader } from '../core/database/YamlShortcutDatabaseFactory.js';

/**
 * Loads individual namespace YAML data files from local file system
 */
export class LocalYamlNamespaceDataLoader implements YamlNamespaceDataLoader {
  public constructor(private readonly path: string) {}

  load(namespace: string): string {
    return fs.readFileSync(`${this.path}/${namespace}.yml`).toString();
  }
}
