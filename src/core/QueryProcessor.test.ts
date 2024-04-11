import { QueryProcessingResultStatus, QueryProcessor } from './QueryProcessor.js';
import { EnvironmentStub } from './Environment.js';
import { ShortcutDatabaseDummy } from './database/ShortcutDatabaseDummy.js';
import { DataDefinitionError } from '../Error.js';

test('process known keyword', async () => {
  const result = await getQueryProcessor().process('bvg Hermannplatz, Alexanderplatz');

  expect(result.status).toBe(QueryProcessingResultStatus.Success);
  expect(result.url).toBe(
    'https://www.bvg.de/de/verbindungen/verbindungssuche?S=Hermannplatz&Z=Alexanderplatz&start=1',
  );
});

test('process unknown keyword', async () => {
  const result = await getQueryProcessor().process('nonexistingkeyword a, b');

  expect(result.status).toBe(QueryProcessingResultStatus.NotFound);
  expect(result.url).toBe(undefined);
});

test('process deprecated shortcut', async () => {
  const result = await getQueryProcessor().process('behvaugeh Alexanderplatz, Hermannplatz');

  expect(result.status).toBe(QueryProcessingResultStatus.Deprecated);
  expect(result.url).toBe(undefined);
  expect(result.deprecated).toEqual({
    created: '2024-03-31',
    alternativeQuery: 'bvg Alexanderplatz, Hermannplatz',
  });
});

test('process deprecated shortcut warns about non matching argument count', async () => {
  const processor = getQueryProcessor();

  expect.assertions(1);
  try {
    await processor.process('invalidalternative A, B');
  } catch (error) {
    expect(error).toBeInstanceOf(DataDefinitionError);
  }
});

test('process with deprecated shortcut without alternative is okay', async () => {
  const result = await getQueryProcessor().process('noalterantive A, B');

  expect(result.status).toBe(QueryProcessingResultStatus.Deprecated);
  expect(result.deprecated).toEqual({
    created: '2024-03-31',
    alternativeQuery: undefined,
  });
});

test('process with non-deprecated shourtcut without url throws exception', async () => {
  const processor = getQueryProcessor();

  expect.assertions(1);
  try {
    await processor.process('resultmissingurl A, B');
  } catch (error) {
    expect(error).toBeInstanceOf(DataDefinitionError);
  }
});

function getQueryProcessor() {
  return new QueryProcessor(new EnvironmentStub(), new ShortcutDatabaseDummy());
}
