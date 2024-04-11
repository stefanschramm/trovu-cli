import { NamespaceSource } from '../core/Environment.js';
import { NamespaceSourceHandler } from '../core/namespaces/NamespaceDispatcher.js';
import { RawShortcut } from '../core/database/Shortcut.js';
import { DataDefinitionError, ImplementationError, UsageError } from '../Error.js';
import fs from 'fs';
import yaml from 'yaml';

export class LocalIndividualYamlNamespaceSourceHandler implements NamespaceSourceHandler {
  private readonly cache: Record<string, Record<string, RawShortcut>> = {};

  public constructor(private readonly path: string) {}

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'string';
  }

  public async get(source: NamespaceSource): Promise<Record<string, RawShortcut>> {
    if (typeof source !== 'string') {
      throw new ImplementationError('NamespaceSource not supported by LocalIndividualNamespaceSourceHandler.');
    }

    if (this.cache[source] === undefined) {
      await this.load(source);
    }

    return this.cache[source];
  }

  private async load(namespace: string): Promise<void> {
    try {
      const content = (await fs.promises.readFile(`${this.path}/${namespace}.yml`)).toString();
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
