import yaml from 'yaml';
import fs from 'fs';
import os from 'os';

import path from 'path';
import {fileURLToPath} from 'url';
import { NamespaceSource } from '../core/Environment';

export type CliConfig = {
  readonly namespaces: NamespaceSource[],
  readonly country: string,
  readonly language: string,
  readonly browser: string,
  readonly shortcutsDir: string,
};

/*

TODO: Make CliConfig compatible to config.yml as described here:

- https://trovu.net/docs/users/advanced/
- https://github.com/trovu/trovu-data-user/blob/master/config.yml

namespaces:
- o
- en
- .us
- github: .
  name: my
# defaultKeyword: g 
language: en
country: us

For the CLI version we could add:

- file: /path/to/shortcuts.yml
  name: examplename

*/

export function getCliConfig(configFile: string | undefined = undefined): CliConfig {
  let effectiveConfigFile: string | undefined;
  if (configFile === undefined) {
    const defaultConfigFile = getDefaultConfigFile();
    if (fs.existsSync(defaultConfigFile)) {
      effectiveConfigFile = defaultConfigFile;
    }
  }
  if (effectiveConfigFile === undefined) {
    return getDefaultConfig();
  }
  const additionalConfiguration = yaml.parse(fs.readFileSync(effectiveConfigFile).toString());

  return {
    ...getDefaultConfig(),
    ...additionalConfiguration,
  };
}

function getDefaultConfigFile(): string {
  return `${os.homedir()}/.trovu.yml`;
}

function getDefaultConfig(): CliConfig {
  const here = path.dirname(fileURLToPath(import.meta.url));
  
  return {
    namespaces: [
      'o',
      'de',
      '.de',
    ],
    country: 'de',
    language: 'de',
    browser: 'open', // TODO: open is xdg-open. Check if this works on other OSes.
    shortcutsDir: `${here}/../../data/shortcuts`,
  };
}

// @ts-expect-error TODO: Refactor config format to match trovu's config.yml as good as possible
// eslint-disable-next-line
type TrovuCliConfig = {
  browser: string,
  officialNamespacesDir: string,
} & TrovuConfig;

type TrovuConfig = {
  readonly namespaces: NamespaceSource[],
  readonly language: string,
  readonly country: string,
  readonly defaultKeyword: string | undefined,
}
