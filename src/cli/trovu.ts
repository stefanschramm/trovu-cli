#!/usr/bin/env node

import { QueryProcessingResultStatus, QueryProcessor } from '../core/QueryProcessor.js';
import { CliEnvironment } from './CliEnvironment.js';
import { spawn } from 'child_process';
import { CliConfig, getCliConfig as getCliConfig } from './CliConfig.js';
import { TrovuError } from '../Error.js';
import { LocalYamlNamespaceDataLoader } from './LocalYamlNamespaceDataLoader.js';
import { YamlNamespaceDataLoader, YamlShortcutDatabaseFactory } from '../core/database/YamlShortcutDatabaseFactory.js';
import { RemoteYamlNamespaceDataLoader } from '../core/database/RemoteYamlNamespaceDataLoader.js';

function main(): void {
  if (process.argv.length < 3) {
    console.error(`Usage: trovu-cli <command>`);
    return;
  }

  // TODO: add useful command line options (commander.js). Examples:
  // --search - Perform a search, similar to trovu.net homepage
  // --show - Display detailed information about a shortcut
  // --output - Just output URL, don't open browser

  // Use all following args to make usage of quotes unnecessary
  // TODO: Not sure if it's good to use all following args
  try {
    const query = process.argv.slice(2).join(' ');

    const cliConfig = getCliConfig();
    const cliEnvironment = new CliEnvironment(cliConfig);
    const namespaceLoader = getNamespaceLoader(cliConfig);
    const databaseFactory = new YamlShortcutDatabaseFactory(namespaceLoader);
    const queryProcessor = new QueryProcessor(cliEnvironment, databaseFactory);

    console.log(`Processing query "${query}"...`);
    const result = queryProcessor.process(query);

    switch (result.status) {
      case QueryProcessingResultStatus.Success:
      {
        if (result.url === undefined) {
          console.error(`No url returned.`);
          return;
        }
        console.log(`Opening ${result.url}`);
        const process = spawn(cliConfig.browser, [result.url], {detached: true, stdio: [ 'ignore', 'ignore', 'ignore']});
        process.unref();
        break;
      }

      case QueryProcessingResultStatus.Deprecated:
      {
        const date = (result.deprecated?.created) ?? 'an unknown date';
        const alternativeQuery = result?.deprecated?.alternativeQuery;
        let message = `This shortcut is deprecated since ${date}.`
        if (alternativeQuery !== undefined) {
          message += ` Try the following query as replacement: "${alternativeQuery}".`;
        }
        console.error(message);
        break;
      }

      case QueryProcessingResultStatus.NotFound:
      {
        console.error('Command not found.');
        break;
      }
    }
  } catch (e) {
    if (e instanceof TrovuError) {
      console.error(`Error while processing query: ${e.message}`);
    } else {
      console.log(e); // show stack trace for unexpected errors
    }
  }
}

function getNamespaceLoader(cliConfig: CliConfig): YamlNamespaceDataLoader {
  if (cliConfig.githubUsername) {
    return new RemoteYamlNamespaceDataLoader(cliConfig.githubUsername);
  }

  return new LocalYamlNamespaceDataLoader(cliConfig.shortcutsDir);
}

main();
