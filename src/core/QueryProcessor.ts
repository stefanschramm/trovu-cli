import { type Environment } from './Environment.js';
import { QueryParser } from './QueryParser.js';
import { UrlProcessor } from './url/UrlProcessor.js';
import { DataDefinitionError } from '../Error.js';
import { ShortcutDatabase } from './database/Shortcut.js';

export class QueryProcessor {
  constructor(
    private readonly environment: Environment,
    private readonly database: ShortcutDatabase,
  ) {}

  public process(query: string): QueryProcessingResult {
    const queryParser = new QueryParser();
    const parsedQuery = queryParser.parse(query);
    // TODO: Where is country used? - Only in UrlProcesor/PlaceholderProcessor?
    // const country = parsedQuery.country ?? this.environment.getCountry();
    const language = parsedQuery.language ?? this.environment.getLanguage();
    const allNamespaces = [...this.environment.getNamespaces(), ...parsedQuery.additionalNamespaces];
    const namespaces = allNamespaces.filter((value, index) => allNamespaces.indexOf(value) === index); // make unique TODO: does === work for all?

    const shortcut = this.database.getShortcut(parsedQuery.keyword, parsedQuery.args.length, language, namespaces);

    if (shortcut === undefined) {
      return { status: QueryProcessingResultStatus.NotFound };
    }

    if (shortcut.deprecated !== undefined) {
      return {
        status: QueryProcessingResultStatus.Deprecated,
        deprecated: {
          created: shortcut.deprecated.created,
          alternativeQuery: determineDeprecationAlternative(shortcut?.deprecated?.alternative?.query, parsedQuery.args),
        },
      };
    }

    // success

    if (shortcut.url === undefined) {
      throw new DataDefinitionError('shortcut.url was undefined although the result was not deprecated!?');
    }

    const urlProcessor = new UrlProcessor(language);

    const targetUrl = urlProcessor.process(shortcut.url, parsedQuery.args);

    return {
      status: QueryProcessingResultStatus.Success,
      url: targetUrl,
    };
  }
}

type QueryProcessingResult = {
  status: QueryProcessingResultStatus;
  url?: string;
  deprecated?: {
    readonly alternativeQuery?: string | undefined;
    readonly created?: string | undefined;
  };
};

export enum QueryProcessingResultStatus {
  Success = 0,
  Deprecated,
  NotFound,
  // TODO: Are there more result states?
}

function determineDeprecationAlternative(alternative: string | undefined, args: string[]): string | undefined {
  if (alternative === undefined) {
    return undefined;
  }

  const placeholderRe = /<[^>]+>/g;
  const placeholderMatches = [...alternative.matchAll(placeholderRe)];

  if (placeholderMatches.length !== args.length) {
    throw new DataDefinitionError(
      `Number of arguments of deprecation alternative (${placeholderMatches.length}) does not match original shortcut's argument count (${args.length}).`,
    );
  }

  let populatedAlternative = alternative;
  for (let i = 0; i < placeholderMatches.length; i++) {
    populatedAlternative = populatedAlternative.replace(placeholderMatches[i][0], args[i]);
  }

  return populatedAlternative;
}
