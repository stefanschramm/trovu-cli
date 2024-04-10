import { Shortcut, ShortcutDatabase, ShortcutDatabaseFactory } from './Shortcut.js';
import yaml from 'yaml';
import { DataDefinitionError, UsageError } from '../../Error.js';
import { NamespaceDataProvider, ObjectShortcutDatabase } from './ObjectShortcutDatabase.js';

export interface YamlNamespaceDataLoader {
  /** Get YAML data for namespace */
  load(namespace: string): string;
}

/**
 * Loader for shortcut databases that are cut up by namespace into invididual YAML files (may be on local filesystem or remote)
 */
export class YamlShortcutDatabaseFactory implements ShortcutDatabaseFactory {
  public constructor(private readonly yamlNamespaceLoader: YamlNamespaceDataLoader) {}

  public getShortcutDatabaseByNamespaces(namespaces: string[]): ShortcutDatabase {
    const namespaceDataProvider = new IndividualYamlNamespaceDataProvider(this.yamlNamespaceLoader);

    return new ObjectShortcutDatabase(namespaces, namespaceDataProvider);
  }
}

/**
 * Parses and caches individual namespace YAML data
 */
class IndividualYamlNamespaceDataProvider implements NamespaceDataProvider {
  private cache: Record<string, Record<string, Shortcut>> = {};

  public constructor(private readonly yamlNamespaceDataLoader: YamlNamespaceDataLoader) {}

  public get(namespace: string): Record<string, Shortcut> {
    if (this.cache[namespace] === undefined) {
      this.load(namespace);
    }

    return this.cache[namespace];
  }

  private load(namespace: string): void {
    try {
      const content = this.yamlNamespaceDataLoader.load(namespace);
      const namespaceData = yaml.parse(content);
      this.cache[namespace] = namespaceData;
    } catch (e) {
      if (e instanceof yaml.YAMLParseError) {
        throw new DataDefinitionError(`Unable to parse data for namespace "${namespace}": {e.message}`);
      } else {
        const message =
          e instanceof Error
            ? `Unable to load data for namespace "${namespace}": ${e.message}`
            : `Unable to load data for namespace "${namespace}.`;
        throw new UsageError(message);
      }
    }
  }
}
