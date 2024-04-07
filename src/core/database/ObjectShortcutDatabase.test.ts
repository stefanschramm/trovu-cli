import { DataDefinitionError } from '../../Error.js';
import { ObjectShortcutDatabase } from './ObjectShortcutDatabase.js';

const firstDummyShortcut = {
  title: 'Example from first namespace',
  url: 'http://example.com/1',
};

const secondDummyShortcut = {
  title: 'Example from second namespace',
  url: 'http://example.com/2',
};

test('getShortcut considers argument count', () => {
  const database = new ObjectShortcutDatabase(
    [{
    'a 1': firstDummyShortcut,
    'a 2': secondDummyShortcut,
    }],
    [
      'first',
      'second',
    ],
  );

  const shortcut = database.getShortcut('a', 2, 'de');

  expect(shortcut).toEqual(secondDummyShortcut);
});

test('getShortcut considers namespace priority', () => {
  const database = new ObjectShortcutDatabase(
    [
      {'a 1': firstDummyShortcut}, // first namespace
      {'a 1': secondDummyShortcut}, // second namespace
    ],
    [
      'first',
      'second',
    ],
  );

  const shortcut = database.getShortcut('a', 1, 'de');

  expect(shortcut).toEqual(firstDummyShortcut);
});

test('getShortcut processes include attribute', () => {
  const database = new ObjectShortcutDatabase(
    [{
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'b 1',
        },
      },
      'b 1': firstDummyShortcut,
    }],
    [
      'dontcare'
    ],
  );

  const shortcut = database.getShortcut('a', 1, 'de');

  expect(shortcut).toEqual({
    // title of "a 1" but url of "b 1"
    title: 'Shortcut including other shortcut',
    url: 'http://example.com/1',
  });
});

// TODO: add test case for "namespace-dependend multi-includes" (leo, dcc, ...)

test('getShortcut returns undefined when shortcut is not found', () => {
  const database = new ObjectShortcutDatabase(
    [{'a 1': firstDummyShortcut}],
    ['dontcare'],
  );

  const shortcut = database.getShortcut('unknownkeyword', 1, 'de');

  expect(shortcut).toEqual(undefined);
});

test('getShortcut throws exception when included shortcut was not found', () => {
  const database = new ObjectShortcutDatabase(
    [{
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'b 1',
        },
      },
    }],
    [
      'dontcare'
    ],
  );

  expect(() => database.getShortcut('a', 1, 'de')).toThrow(DataDefinitionError);
});

test('getShortcut throws exception on circular includes', () => {
  const database = new ObjectShortcutDatabase(
    [{
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
    }],
    [
      'dontcare'
    ],
  );

  expect(() => database.getShortcut('a', 1, 'de')).toThrow(DataDefinitionError);
});