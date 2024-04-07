import { ImplementationError } from '../../Error.js';
import { ShortcutDatabase, ShortcutDatabaseFactory } from './Shortcut.js';
import { ObjectShortcutDatabase } from './ObjectShortcutDatabase.js';

/**
 * Loader for precompiled shortcut database where everything is in one single file
 */
export class YamlShortcutDatabaseFactory implements ShortcutDatabaseFactory {
  public getShortcutDatabaseByNamespaces(
    namespaces: string[],
  ): ShortcutDatabase {
    // TODO: To use fetch() here, the interfaces must be changed to use Promises (async/await)

    // const url = 'https://trovu.net/data.json';

    throw new ImplementationError('Loading from remote is not implemented yet.');
    
    return new ObjectShortcutDatabase([], namespaces);
  }
}
