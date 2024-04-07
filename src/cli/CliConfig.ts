import yaml from 'yaml';
import fs from 'fs';
import os from 'os';

import path from 'path';
import {fileURLToPath} from 'url';

export type CliConfig = {
  readonly country: string,
  readonly language: string,
  readonly githubUsername: string | undefined,
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
    country: 'de',
    language: 'de',
    githubUsername: undefined,
    browser: 'open', // TODO: open is xdg-open. Check if this works on other OSes.
    shortcutsDir: `${here}/../../data/shortcuts`,
  };
}
