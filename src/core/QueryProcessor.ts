import { type Environment } from './Environment.js';
import { Shortcut, ShortcutDatabaseFactory } from './database/Shortcut.js';
import { QueryParser } from './QueryParser.js';
import { UrlProcessor } from './url/UrlProcessor.js';
import { DataDefinitionError, ImplementationError } from '../Error.js';

export class QueryProcessor {
  constructor (
    private readonly environment: Environment,
    private readonly shortcutDatabaseFactory: ShortcutDatabaseFactory,
  ) {}

  public process(query: string): QueryProcessingResult {
    const queryParser = new QueryParser();
    const parsedQuery = queryParser.parse(query);
    const country = parsedQuery.country ?? this.environment.getCountry();
    const language = parsedQuery.language ?? this.environment.getLanguage();
    const allNamespaces = [
      ...parsedQuery.additionalNamespaces,
      `.${country}`,
      language,
      'o',
    ];
    const namespaces = allNamespaces.filter((value, index) => allNamespaces.indexOf(value) === index);
    const database = this.shortcutDatabaseFactory.getShortcutDatabaseByNamespaces(namespaces);

    const shortcut = database.getShortcut(parsedQuery.keyword, parsedQuery.args.length, language);

    const resultStatus = determineResultStatus(shortcut);

    switch (resultStatus) {
      case QueryProcessingResultStatus.NotFound:
        return {
          status: resultStatus
        };

      case QueryProcessingResultStatus.Deprecated:
        return {
          status: resultStatus,
          deprecated: {
            created: shortcut?.deprecated?.created,
            alternativeQuery: determineDeprecationAlternative(shortcut?.deprecated?.alternative?.query, parsedQuery.args),
          }
        };

      case QueryProcessingResultStatus.Success:
      {
        if (shortcut?.url === undefined) {
          throw new ImplementationError('shortcut?.url was undefined after checking ');
        }
    
        const urlProcessor = new UrlProcessor(language);
    
        const targetUrl = urlProcessor.process(shortcut.url, parsedQuery.args);
    
        return {
          status: QueryProcessingResultStatus.Success,
          url: targetUrl,
        };
      }
    }
    // unreachable
  }
}

type QueryProcessingResult = {
  status: QueryProcessingResultStatus;
  url?: string;
  deprecated?: {
    readonly alternativeQuery?: string | undefined,
    readonly created?: string | undefined,
  },
};

export enum QueryProcessingResultStatus {
  Success = 0,
  Deprecated,
  NotFound,
  // TODO: Are there more result states?
}

function determineResultStatus(shortcut: Shortcut | undefined): QueryProcessingResultStatus {
  if (shortcut === undefined) {
    return QueryProcessingResultStatus.NotFound;
  }
  if (shortcut.deprecated !== undefined) {
    return QueryProcessingResultStatus.Deprecated;
  }

  return QueryProcessingResultStatus.Success;
}

function determineDeprecationAlternative(alternative: string | undefined, args: string[]): string | undefined {
  if (alternative === undefined) {
    return undefined;
  }

  const placeholderRe = /<[^>]+>/g;
  const placeholderMatches = [...alternative.matchAll(placeholderRe)];

  if (placeholderMatches.length !== args.length) {
    throw new DataDefinitionError(`Number of arguments of deprecation alternative (${placeholderMatches.length}) does not match original shortcut's argument count (${args.length}).`);
  }

  let populatedAlternative = alternative;
  for (let i = 0; i < placeholderMatches.length; i++) {
    populatedAlternative = populatedAlternative.replace(placeholderMatches[i][0], args[i]);
  }

  return populatedAlternative;
}
