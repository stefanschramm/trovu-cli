import { NamespaceSource, type Environment } from './Environment.js';
import { ShortcutDatabaseFactory } from './database/Shortcut.js';
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
    // TODO: Where is country used? - Only in UrlProcesor/PlaceholderProcessor?
    // const country = parsedQuery.country ?? this.environment.getCountry();
    const language = parsedQuery.language ?? this.environment.getLanguage();
    const allNamespaces = [
      // TODO: We should pass the complete namespace source definitions to the shortcutDatabaseFactory (instead of just the strings).
      ...mapNamespaceSources(this.environment.getNamespaces()),
      ...parsedQuery.additionalNamespaces,
    ];
    const namespaces = allNamespaces.filter((value, index) => allNamespaces.indexOf(value) === index); // make unique
    const database = this.shortcutDatabaseFactory.getShortcutDatabaseByNamespaces(namespaces);

    const shortcut = database.getShortcut(parsedQuery.keyword, parsedQuery.args.length, language);

    // const resultStatus = determineResultStatus(shortcut);

    if (shortcut === undefined) {
      return {status: QueryProcessingResultStatus.NotFound};
    }

    if (shortcut.deprecated !== undefined) {
      return {
        status: QueryProcessingResultStatus.Deprecated,
        deprecated: {
          created: shortcut?.deprecated?.created,
          alternativeQuery: determineDeprecationAlternative(shortcut?.deprecated?.alternative?.query, parsedQuery.args),
        }
      };
    }

    // success

    if (shortcut?.url === undefined) {
      throw new DataDefinitionError('shortcut?.url was undefined although the result was not deprecated!?');
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

function mapNamespaceSources(namespaces: NamespaceSource[]): string[] {
  const namespaceNames: string[] = [];
  for (const namespace of namespaces) {
    if (typeof namespace === 'string') {
      namespaceNames.push(namespace);
      continue;
    }
    
    // TODO
    throw new ImplementationError('Non-official namespace sources are currently not supported.');
  }
  
  return namespaceNames;
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
