import { DataDefinitionError } from '../../Error.js';
import { NamespaceDataProvider, ObjectShortcutDatabase } from './ObjectShortcutDatabase.js';
import { Shortcut } from './Shortcut.js';

const firstDummyShortcut = {
  title: 'First dummy shortcut',
  url: 'http://example.com/1',
};

const secondDummyShortcut = {
  title: 'Second dummy shortcut',
  url: 'http://example.com/2',
};

test('getShortcut considers argument count', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {
      'a 1': firstDummyShortcut,
      'a 2': secondDummyShortcut,
    },
  });
  const database = new ObjectShortcutDatabase(['first'], namespaceDataProvider);

  const shortcut = database.getShortcut('a', 2, 'de');

  expect(shortcut).toEqual(secondDummyShortcut);
});

test('getShortcut considers namespace priority', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {'a 1': firstDummyShortcut},
    second: {'a 1': secondDummyShortcut},
  });
  const database = new ObjectShortcutDatabase(['second', 'first'], namespaceDataProvider);

  const shortcut = database.getShortcut('a', 1, 'de');

  expect(shortcut).toEqual(secondDummyShortcut);
});

test('getShortcut processes include attribute', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'b 1',
        },
      },
      'b 1': firstDummyShortcut,
    },
  });
  const database = new ObjectShortcutDatabase(['first'], namespaceDataProvider);

  const shortcut = database.getShortcut('a', 1, 'de');

  expect(shortcut).toEqual({
    // title of "a 1" but url of "b 1"
    title: 'Shortcut including other shortcut',
    url: 'http://example.com/1',
  });
});

test('getShortcut processes include list attribute', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: [
          {
            namespace: 'second',
            key: 'b 1',
          },
          {
            namespace: 'third',
            key: 'b 1',
          },
        ],
      },
    },
    second: {
      'b 1': firstDummyShortcut,
    },
    third: {
      'b 1': secondDummyShortcut,
    },
  });
  const database = new ObjectShortcutDatabase(['first'], namespaceDataProvider);

  const shortcut = database.getShortcut('a', 1, 'de');

  expect(shortcut).toEqual({
    // title of "a 1" but url of "b 1" of second (not third!) namespace
    title: 'Shortcut including other shortcut',
    url: 'http://example.com/1',
  });
});

test('getShortcut processes include list attribute and returns undefined if include was not found', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: [
          {
            namespace: 'second',
            key: 'c 1',
          },
        ],
      },
    },
    second: {},
  });
  const database = new ObjectShortcutDatabase(['first'], namespaceDataProvider);

  const shortcut = database.getShortcut('a', 1, 'de');

  expect(shortcut).toBeUndefined();
});

test('getShortcut throws exception when included shortcut was not found', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'b 1',
        },
      },
    },
  });
  const database = new ObjectShortcutDatabase(['first'], namespaceDataProvider);

  expect(() => database.getShortcut('a', 1, 'de')).toThrow(DataDefinitionError);
});

test('getShortcut returns undefined when shortcut is not found', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {'a 1': firstDummyShortcut},
  });
  const database = new ObjectShortcutDatabase(['first'], namespaceDataProvider);

  const shortcut = database.getShortcut('unknownkeyword', 1, 'de');

  expect(shortcut).toEqual(undefined);
});

test('getShortcut throws exception on circular includes', () => {
  const namespaceDataProvider = new NamespaceDataProviderStub({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'b 1',
        },
      },
      'b 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'a 1',
        },
      },
    },
  });
  const database = new ObjectShortcutDatabase(['first'], namespaceDataProvider);

  expect(() => database.getShortcut('a', 1, 'de')).toThrow(DataDefinitionError);
});

class NamespaceDataProviderStub implements NamespaceDataProvider {
  public constructor(
    private readonly data: Record<string, Record<string, Shortcut>>,
  ) {}

  get(namespace: string): Record<string, Shortcut> {
    return this.data[namespace];
  }
}
