import { ImplementationError } from '../Error.js';
import { NamespaceSource } from './Environment.js';
import { Shortcut } from './database/Shortcut.js';

export interface NamespaceSourceHandler {
  supports(source: NamespaceSource): boolean;
  get(source: NamespaceSource): Record<string, Shortcut>;
}

export class NamespaceDispatcher {
  public constructor(private readonly namespaceSourceHandlers: NamespaceSourceHandler[]) {}

  public get(source: NamespaceSource): Record<string, Shortcut> {
    for (const namespaceSourceHandler of this.namespaceSourceHandlers) {
      if (namespaceSourceHandler.supports(source)) {
        return namespaceSourceHandler.get(source);
      }
    }

    throw new ImplementationError('No NamespaceSourceHandler found.');
  }
}
