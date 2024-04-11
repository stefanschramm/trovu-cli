import { NamespaceSource } from '../core/Environment.js';
import { NamespaceSourceHandler } from '../core/NamespaceDispatcher.js';
import { Shortcut } from '../core/database/Shortcut.js';
import { DataDefinitionError, ImplementationError, UsageError } from '../Error.js';
import fs from 'fs';
import yaml from 'yaml';

export class LocalIndividualNamespaceSourceHandler implements NamespaceSourceHandler {
  private readonly cache: Record<string, Record<string, Shortcut>> = {};

  public constructor(
    private readonly path: string,
  ) {}

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'string';
  }

  public get(source: NamespaceSource): Record<string, Shortcut> {
    if (typeof source !== 'string') {
      throw new ImplementationError('NamespaceSource not supported by LocalIndividualNamespaceSourceHandler.');
    }

    if (this.cache[source] === undefined) {
      this.load(source);
    }

    return this.cache[source];
  }

  private load(namespace: string): void {
    try {
      const content = fs.readFileSync(`${this.path}/${namespace}.yml`).toString();
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
