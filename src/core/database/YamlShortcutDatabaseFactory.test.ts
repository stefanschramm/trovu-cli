import { DataDefinitionError, ImplementationError, UsageError } from '../../Error.js';
import { YamlNamespaceDataLoader, YamlShortcutDatabaseFactory } from './YamlShortcutDatabaseFactory.js';

test('getShortcutDatabaseByNamespaces', () => {
  const factory = getFactory();

  const database = factory.getShortcutDatabaseByNamespaces(['bbb', 'aaa']);

  const shortcut = database.getShortcut('b', 1, 'de');

  expect(shortcut).toEqual({
    title: 'Example shortcut in namespace bbb',
    url: 'https://example.com/bbb?q=<query>',
  });
});

test('getShortcut on database throws exception for malformed yaml', () => {
  const database = getFactory().getShortcutDatabaseByNamespaces(['malformedyaml']);

  expect(() => database.getShortcut('b', 1, 'de')).toThrow(DataDefinitionError);
});

test('getShortcut on database throws exception on error exception', () => {
  const database = getFactory().getShortcutDatabaseByNamespaces(['notfound']);

  expect(() => database.getShortcut('b', 1, 'de')).toThrow(UsageError);
});

test('getShortcut on database throws exception on non-error loading exception', () => {
  const database = getFactory().getShortcutDatabaseByNamespaces(['notfound2']);

  expect(() => database.getShortcut('b', 1, 'de')).toThrow(UsageError);
});

function getFactory() {
  const loader = new DummyYamlNamespaceDataLoader();
  const factory = new YamlShortcutDatabaseFactory(loader);

  return factory;
}

class DummyYamlNamespaceDataLoader implements YamlNamespaceDataLoader {
  load(namespace: string): string {
    if (namespace === 'aaa') {
      return `
a 0:
  title: Example shortcut namespace aaa
  url: https://example.com/aaa
`;
    } else if (namespace === 'bbb') {
      return `
b 1:
  title: Example shortcut in namespace bbb
  url: https://example.com/bbb?q=<query>
`;
    } else if (namespace === 'malformedyaml') {
      return '"malformed yaml';
    } else if (namespace === 'notfound') {
      // The actual exception will differ (filesystem vs. fetch-calls)
      throw Error('Not found.');
    } else if (namespace === 'notfound2') {
      throw 'String as exception';
    }

    throw new ImplementationError('Namespace not available in DummyYamlNamespaceDataLoader.');
  }
}
