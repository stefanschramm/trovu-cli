export interface Environment {
  getCountry(): string;
  getLanguage(): string;
  getGithubUsername(): string | undefined;
  // TODO: default dictionary? / dictionary priorities?
}

/**
 * Common Environment stub for unit tests
 */
export class EnvironmentStub implements Environment {
  public getCountry(): string {
    return 'de';
  }

  public getLanguage(): string {
    return 'de';
  }

  // istanbul ignore next (ignore coverage for currently unused stub method)
  public getGithubUsername(): string | undefined {
    return undefined;
  }
}
