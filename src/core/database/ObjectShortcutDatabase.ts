import { DataDefinitionError } from '../../Error.js';
import { NamespaceSource } from '../Environment.js';
import { NamespaceDispatcher } from '../NamespaceDispatcher.js';
import { IncludeDefinition, Shortcut, ShortcutDatabase } from './Shortcut.js';

/**
 * Shortcut database that is based on a hierarchy of JavaScript objects grouped by namespaces (classical Trovu YAML data)
 */
export class ObjectShortcutDatabase implements ShortcutDatabase {
  constructor(
    private readonly namespaceDispatcher: NamespaceDispatcher,
  ) {}

  public getShortcut(keyword: string, argumentCount: number, language: string, namespaces: NamespaceSource[]): Shortcut | undefined {
    const searchKey = `${keyword} ${argumentCount}`;
    const finder = new ShortcutFinder(namespaces, this.namespaceDispatcher, language);

    return finder.getShortcutBySearchKey(searchKey);
  }
}

class ShortcutFinder {
  public constructor(
    private readonly namespaces: NamespaceSource[],
    private readonly namespaceDispatcher: NamespaceDispatcher,
    /** Language to use when replacing search keys of includes */
    private readonly language: string,
  ) {}

  public getShortcutBySearchKey(
    searchKey: string,
    overrideNamespaces: NamespaceSource[] | undefined = undefined,
    maxDepth = 10,
  ): Shortcut | undefined {
    if (maxDepth <= 0) {
      throw new DataDefinitionError(`Possible circular inclusion detected for searchKey "${searchKey}".`);
    }

    const namespacesToSearchIn = overrideNamespaces === undefined ? this.namespaces : overrideNamespaces;

    for (const namespace of namespacesToSearchIn) {
      let shortcut = this.namespaceDispatcher.get(namespace)[searchKey];
      if (shortcut === undefined) {
        continue; // look in next namespace
      }

      if (shortcut.include !== undefined) {
        const includedShortcut = this.getShortcutByIncludeDefinition(shortcut.include, overrideNamespaces, --maxDepth);
        if (includedShortcut === undefined) {
          // We don't return partial shortcuts (for example title without url would be useless).
          return undefined;
        }
        delete shortcut['include']; // TODO: clone shortcut. (Otherwise it will probably modify the database because everything are references!)
        shortcut = {
          ...includedShortcut,
          ...shortcut,
        };
      }

      // TODO: add support for "short notation" where shortcut is just a string instead of an object ("examplekeyword 1: http://www.example.com/?q=<param1>") - it should be mapped to match the Shortcut type

      return shortcut;
    }

    return undefined; // keyword not found
  }

  private getShortcutByIncludeDefinition(
    include: IncludeDefinition,
    overrideNamespaces: NamespaceSource[] | undefined,
    maxDepth = 10,
  ): Shortcut | undefined {
    if (include instanceof Array) {
      // List of references by namespace - namespace to search in comes from include, not from usual namespace priority list
      for (const includeEntry of include) {
        const referencedShortcut = this.getShortcutBySearchKey(
          this.mapSearchKey(includeEntry.key),
          [includeEntry.namespace],
          maxDepth,
        );
        if (referencedShortcut !== undefined) {
          return referencedShortcut;
        }
      }
      return undefined;
    } else {
      // One single shortcut
      return this.getShortcutBySearchKey(this.mapSearchKey(include.key), overrideNamespaces, maxDepth);
    }
  }

  private mapSearchKey(searchKey: string): string {
    return searchKey.replace('<$language>', this.language);
  }
}
