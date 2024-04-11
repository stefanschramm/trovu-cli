import { NamespaceSource } from '../core/Environment.js';
import { NamespaceSourceHandler } from '../core/NamespaceDispatcher.js';
import { Shortcut } from '../core/database/Shortcut.js';
import { ImplementationError } from '../Error.js';

export class RemoteSingleNamespaceSourceHandler implements NamespaceSourceHandler {
  private cache: Record<string, Record<string, Shortcut>> = {};

  public constructor(private readonly url: string) {}

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'string';
  }

  public async get(source: NamespaceSource): Promise<Record<string, Shortcut>> {
    if (typeof source !== 'string') {
      throw new ImplementationError('NamespaceSource not supported by RemoteSingleNamespaceSourceHandler.');
    }

    if (this.cache[source] === undefined) {
      await this.load();
    }

    return this.cache[source];
  }

  private async load(): Promise<void> {
    const response = await fetch(this.url);
    const responseData = await response.json();
    this.cache = responseData['shortcuts'];
  }
}
