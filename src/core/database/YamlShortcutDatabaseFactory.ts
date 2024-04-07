import { ShortcutDatabase, ShortcutDatabaseFactory } from './Shortcut.js';
import yaml from 'yaml';
import { DataDefinitionError, UsageError } from '../../Error.js';
import { ObjectShortcutDatabase } from './ObjectShortcutDatabase.js';

export interface YamlNamespaceDataLoader {
  /** Get YAML data for namespace */
  load(namespace: string): string;
}

/**
 * Loader for shortcut databases that are cut up by namespace into invididual yaml files (local filesystem or remote)
 */
export class YamlShortcutDatabaseFactory implements ShortcutDatabaseFactory {
  public constructor(private readonly yamlNamespaceLoader: YamlNamespaceDataLoader) {}

  public getShortcutDatabaseByNamespaces(
    namespaces: string[],
  ): ShortcutDatabase {

    const data = [];
    for (const namespace of namespaces) {
      try {
        const content = this.yamlNamespaceLoader.load(namespace);
        const namespaceData = yaml.parse(content);
        data.push(namespaceData);
      } catch(e) {
        if (e instanceof yaml.YAMLParseError) {
          throw new DataDefinitionError(`Unable to parse data for namespace "${namespace}": {e.message}`);
        } else {
          const message = e instanceof Error
            ? `Unable to load data for namespace "${namespace}": ${e.message}`
            : `Unable to load data for namespace "${namespace}.`
          ;
          throw new UsageError(message);
        }
      }
    }

    return new ObjectShortcutDatabase(data, namespaces);
  }
}
