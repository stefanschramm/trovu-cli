import { Shortcut } from './Shortcut.js';
import { ShortcutDatabase } from './ShortcutDatabase.js';

/**
 * Dummy for usage in unit tests
 */
export class ShortcutDatabaseDummy implements ShortcutDatabase {
  public async getShortcut(keyword: string, argumentCount: number): Promise<Shortcut | undefined> {
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
        },
      };
    }

    if (keyword === 'noalterantive' && argumentCount === 2) {
      return {
        deprecated: {
          created: '2024-03-31',
        },
      };
    }

    if (keyword === 'invalidalternative' && argumentCount === 2) {
      return {
        deprecated: {
          alternative: {
            query: 'alternative <1>, <2>, <3>', // invalid number of arguments in alternative
          },
          created: '2024-03-31',
        },
      };
    }

    if (keyword === 'resultmissingurl' && argumentCount === 2) {
      return {
        title: 'Result with missing URL',
      };
    }

    return undefined;
  }
}
