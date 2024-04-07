export class QueryParser {
  public parse(query: string): ParsedQuery {
    // TODO: does this cover the complete syntax?
    const queryParts = query.split(' ');
    const keywordParts = queryParts[0].split('.');
    const keyword = keywordParts[keywordParts.length - 1];
    const args = queryParts.slice(1).join(' ').split(',').map((keyword: string) => keyword.trim());
    let language: string | undefined = undefined;
    const country: string | undefined = undefined;
    const additionalNamespaces: string[] = [];
  
    const prefixes = keywordParts.slice(0, keywordParts.length - 1);
    for (const prefix of prefixes) {
      if (prefix.length == 2) {
        language = prefix; // TODO: language vs. country?
      } else {
        additionalNamespaces.push(prefix);
      }
    }
  
    return {
      additionalNamespaces,
      keyword,
      args,
      language,
      country,
    };
  }
}

export type ParsedQuery = {
  additionalNamespaces: string[];
  keyword: string;
  args: string[];
  language: string | undefined;
  country: string | undefined;
  // TODO: other attributes?
};
