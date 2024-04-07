import { DataDefinitionError } from '../../Error.js';
import { Shortcut, ShortcutDatabase } from './Shortcut.js';

export class ObjectShortcutDatabase implements ShortcutDatabase {
  constructor(
    /** List of namespaces ordered by decending priority */
    private readonly database: Record<string, Shortcut>[],
    private readonly loadedNamespaces: string[],
  ) {}

  public getShortcut(keyword: string, argumentCount: number, language: string): Shortcut | undefined {
    const searchKey = `${keyword} ${argumentCount}`;
    const finder = new ShortcutFinder(this.database, this.loadedNamespaces, language)

    return finder.getShortcutBySearchKey(searchKey);
  }
}

class ShortcutFinder {
  public constructor(
    private readonly database: Record<string, Shortcut>[],
    private readonly loadedNamespaces: string[],
    /** Language to use when replacing search keys of includes */
    private readonly language: string,
  ) {}

  public getShortcutBySearchKey(searchKey: string, maxDepth = 10): Shortcut | undefined {
    if (maxDepth <= 0) {
      throw new DataDefinitionError(`Possible circular inclusion detected for searchKey "${searchKey}".`);
    }
    for (const namespaceData of this.database) {
      let shortcut = namespaceData[searchKey];
      if (shortcut === undefined) {
        continue; // look in next namespace
      }
      // TODO: add support for "short notation" where shortcut is just a string instead of an object ("examplekeyword 1: http://www.example.com/?q=<param1>")
      if (shortcut.include !== undefined) {
        const referencedShortcutSearchKey = this.determineReferencedShortcutSearchKey(shortcut.include);
        const referencedShortcut = this.getShortcutBySearchKey(referencedShortcutSearchKey, --maxDepth);
        if (referencedShortcut === undefined) {
          throw new DataDefinitionError(`Included shortcut "${referencedShortcutSearchKey}" was not found.`);
        }
        delete(shortcut['include']);
        shortcut = {
          ...referencedShortcut,
          ...shortcut,
        };
      }

      return shortcut;
    }

    return undefined; // keyword not found
  }

  private determineReferencedShortcutSearchKey(include: IncludeDefinition): string {
    let searchKey: string;
    if (include instanceof Array) {
      const includesMatchingAvailableNamespaces = include.filter((include: NamespaceIncludeDefinition) => this.loadedNamespaces.includes(include.namespace));

      if (includesMatchingAvailableNamespaces.length === 0) {
        const missingNamespaces = include.map((include) => include.namespace);
        throw new DataDefinitionError(`Unable to find any matching namespace for includes. Add one of the following namespaces to your environment or query: ${missingNamespaces.join(', ')}`);
      }

      /**
       * TODO
       * The priority for the namespace is determined by the include-list of the shortcut, not the normal namespace priority.
       * We need to dynamically load the other individual namespace YAMLs.
       * The shortcut database therefore needs to keep a map which data came from which namespace (and if it already has been loaded).
       */

      /**
       * TODO
       * Shall we have special handling for the condition (includesMatchingAvailableNamespaces.length > 1)
       * ...in case there are multiple includes with different search keys?
       */

      searchKey = includesMatchingAvailableNamespaces[0].key;
    } else {
      // simple single include
      searchKey = include.key;
    }

    searchKey = searchKey.replace('<$language>', this.language);

    return searchKey; 
  }
}

type IncludeDefinition  = {key: string} | NamespaceIncludeDefinition[];

type NamespaceIncludeDefinition = {
  key: string,
  namespace: string,
};
