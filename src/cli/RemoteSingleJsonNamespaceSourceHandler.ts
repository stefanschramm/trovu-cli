import { NamespaceSource } from '../core/Environment.js';
import { NamespaceSourceHandler } from '../core/NamespaceDispatcher.js';
import { RawShortcut } from '../core/database/Shortcut.js';
import { ImplementationError } from '../Error.js';

/**
 * This handler is supposed to be used with Trovu's "copiled" JSON shortcut database
 */
export class RemoteSingleJsonNamespaceSourceHandler implements NamespaceSourceHandler {
  private cache: Record<string, Record<string, RawShortcut>> = {};

  /**
   * @param url Example: https://trovu.net/data.json
   */
  public constructor(private readonly url: string) {}

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'string';
  }

  public async get(source: NamespaceSource): Promise<Record<string, RawShortcut>> {
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