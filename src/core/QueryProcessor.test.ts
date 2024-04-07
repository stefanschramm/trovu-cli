import { QueryProcessingResultStatus, QueryProcessor } from './QueryProcessor.js';
import { EnvironmentStub } from './Environment.js';
import { ShortcutDatabaseStubFactory } from './database/ShortcutDatabaseStubFactors.js';
import { DataDefinitionError } from '../Error.js';

test('process with known keyword', () => {
  const result = getQueryProcessor().process('bvg Hermannplatz, Alexanderplatz');

  expect(result.status).toBe(QueryProcessingResultStatus.Success);
  expect(result.url).toBe('https://www.bvg.de/de/verbindungen/verbindungssuche?S=Hermannplatz&Z=Alexanderplatz&start=1');
});

test('process with unknown keyword', () => {
  const result = getQueryProcessor().process('nonexistingkeyword a, b');

  expect(result.status).toBe(QueryProcessingResultStatus.NotFound);
  expect(result.url).toBe(undefined);
});


test('process with deprecated shortcut', () => {
  const result = getQueryProcessor().process('behvaugeh Alexanderplatz, Hermannplatz');

  expect(result.status).toBe(QueryProcessingResultStatus.Deprecated);
  expect(result.url).toBe(undefined);
  expect(result.deprecated).toEqual({
    created: '2024-03-31',
    alternativeQuery: 'bvg Alexanderplatz, Hermannplatz',
  });
});

test('process with deprecated shortcut warns about non matching argument count', () => {
  const processor = getQueryProcessor();

  expect(() => processor.process('invalidalternative A, B')).toThrow(DataDefinitionError);
});

function getQueryProcessor() {
  return new QueryProcessor(
    new EnvironmentStub(),
    new ShortcutDatabaseStubFactory(),
  );
}