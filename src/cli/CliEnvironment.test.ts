import { CliEnvironment } from './CliEnvironment.js';

const testCliConfig = {
  country: 'aa',
  language: 'bb',
  browser: 'dontcare',
  shortcutsDir: 'dontcare',
  githubUsername: 'github.username',
}

test('getCountry', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getCountry()).toEqual('aa');
});

test('getLanguage', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getLanguage()).toEqual('bb');
});

test('getGithubUsername', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getGithubUsername()).toEqual('github.username');
});
