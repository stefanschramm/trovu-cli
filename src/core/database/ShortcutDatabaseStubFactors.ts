import { Shortcut, ShortcutDatabase, ShortcutDatabaseFactory } from './Shortcut.js';

/**
 * Creates ShortcutDatabaseStub for usage in unit tests
 */
export class ShortcutDatabaseStubFactory implements ShortcutDatabaseFactory {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getShortcutDatabaseByNamespaces(_namespaces: string[]): ShortcutDatabase {
    return new ShortcutDatabaseStub();
  }
}

class ShortcutDatabaseStub implements ShortcutDatabase {
  getShortcut(keyword: string, argumentCount: number): Shortcut | undefined {
    if (keyword === 'bvg' && argumentCount === 2) {
      return {
        url: 'https://www.bvg.de/de/verbindungen/verbindungssuche?S=<Start>&Z=<Ziel>&start=1',
        title: 'BVG-Fahrplanauskunft',
      };
    }

    if (keyword === 'behvaugeh' && argumentCount === 2) {
      return {
        deprecated: {
          alternative: {
            query: 'bvg <1>, <2>',
          },
          created: '2024-03-31',
        }
      }
    }

    if (keyword === 'invalidalternative' && argumentCount === 2) {
      return {
        deprecated: {
          alternative: {
            query: 'alternative <1>, <2>, <3>', // invalid number of arguments in alternative
          },
          created: '2024-03-31',
        }
      }
    }

    return undefined;
  }
}
