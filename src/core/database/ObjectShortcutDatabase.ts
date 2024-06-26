import { DataDefinitionError } from '../../Error.js';
import { NamespaceSource } from '../Environment.js';
import { NamespaceDispatcher } from '../namespaces/NamespaceDispatcher.js';
import { IncludeDefinition, Shortcut } from './Shortcut.js';
import { ShortcutDatabase } from './ShortcutDatabase.js';

/**
 * Shortcut database that is based on a hierarchy of JavaScript objects grouped by namespaces (classical Trovu YAML data)
 */
export class ObjectShortcutDatabase implements ShortcutDatabase {
  constructor(private readonly namespaceDispatcher: NamespaceDispatcher) {}

  public async getShortcut(
    keyword: string,
    argumentCount: number,
    language: string,
    namespaces: NamespaceSource[],
  ): Promise<Shortcut | undefined> {
    const searchKey = `${keyword} ${argumentCount}`;
    const finder = new ShortcutFinder(namespaces, this.namespaceDispatcher, language);

    return await finder.getShortcutBySearchKey(searchKey);
  }
}

class ShortcutFinder {
  public constructor(
    private readonly namespaces: NamespaceSource[],
    private readonly namespaceDispatcher: NamespaceDispatcher,
    /** Language to use when replacing search keys of includes */
    private readonly language: string,
  ) {}

  public async getShortcutBySearchKey(
    searchKey: string,
    overrideNamespaces: NamespaceSource[] | undefined = undefined,
    maxDepth = 10,
  ): Promise<Shortcut | undefined> {
    if (maxDepth <= 0) {
      throw new DataDefinitionError(`Possible circular inclusion detected for searchKey "${searchKey}".`);
    }

    const namespacesToSearchIn = overrideNamespaces === undefined ? this.namespaces : overrideNamespaces;

    for (const namespace of namespacesToSearchIn) {
      let shortcut = (await this.namespaceDispatcher.get(namespace))[searchKey];
      if (shortcut === undefined) {
        continue; // look in next namespace
      }

      if (typeof shortcut === 'string') {
        // short string-only notation (not used in official namespaces)
        return {
          url: replaceLegacyUrlPlaceholders(shortcut),
        };
      }

      if (shortcut.include !== undefined) {
        const includedShortcut = await this.getShortcutByIncludeDefinition(
          shortcut.include,
          overrideNamespaces,
          --maxDepth,
        );
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

  private async getShortcutByIncludeDefinition(
    include: IncludeDefinition,
    overrideNamespaces: NamespaceSource[] | undefined,
    maxDepth = 10,
  ): Promise<Shortcut | undefined> {
    if (include instanceof Array) {
      // List of references by namespace - namespace to search in comes from include, not from usual namespace priority list
      for (const includeEntry of include) {
        const referencedShortcut = await this.getShortcutBySearchKey(
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
      return await this.getShortcutBySearchKey(this.mapSearchKey(include.key), overrideNamespaces, maxDepth);
    }
  }

  private mapSearchKey(searchKey: string): string {
    return searchKey.replace('<$language>', this.language);
  }
}

function replaceLegacyUrlPlaceholders(url: string): string {
  const placeholderRe = /{%([^}]+)}/g;
  let replacedUrl = url;
  for (const match of replacedUrl.matchAll(placeholderRe)) {
    console.log('match:', match);
    replacedUrl = replacedUrl.replace(match[0], `<${match[1]}>`);
  }

  return replacedUrl;
}
