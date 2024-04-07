import { ImplementationError } from '../../Error.js';
import { YamlNamespaceDataLoader } from './YamlShortcutDatabaseFactory.js';

export class RemoteYamlNamespaceDataLoader implements YamlNamespaceDataLoader {
  // @ts-expect-error // TODO: use githubUsername
  public constructor(private readonly githubUsername: string) {}

  // TODO: use namespace
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(_namespace: string): string {
    // TODO: what is the correct path? Actually this should be generalized so the user would be able to specify a URL pattern in the CliConfig.

    // const url = `https://raw.githubusercontent.com/${this.githubUsername}/trovu/master/data/shortcuts/${namespace}.yml`;

    // TODO: To use fetch() here, the interfaces must be changed to use Promises (async/await)

    throw new ImplementationError('Loading from remote is not implemented yet.');
  }
}
