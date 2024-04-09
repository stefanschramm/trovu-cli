import { CliEnvironment } from './CliEnvironment.js';

const testCliConfig = {
  namespaces: [
    'o',
    'aa',
    '.bb',
  ],
  country: 'aa',
  language: 'bb',
  browser: 'dontcare',
  shortcutsDir: 'dontcare',
}

test('getNamespaces', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getNamespaces()).toEqual([
    'o',
    'aa',
    '.bb',
  ]);
});

test('getCountry', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getCountry()).toEqual('aa');
});

test('getLanguage', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getLanguage()).toEqual('bb');
});
