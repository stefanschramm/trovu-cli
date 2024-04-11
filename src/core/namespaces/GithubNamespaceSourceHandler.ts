import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment';
import { NamespaceSourceHandler } from './NamespaceDispatcher';

export class GithubNamespaceSourceHandler implements NamespaceSourceHandler {
  public supports(source: NamespaceSource): boolean {
    return typeof source === 'object' && source.github !== undefined;
  }

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    console.log('getting source:', source);
    throw new Error('TODO Method not implemented.'); // TODO
  }
}
