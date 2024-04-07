import { DataDefinitionError } from '../../Error.js';
import { VariablePlaceholderProcessor } from './VariablePlaceholderProcessor.js';

test('process replaces language', () => {
  const processor = new VariablePlaceholderProcessor('de');

  const result = processor.process('<$language>');

  expect(result).toEqual('de');
});

// TODO: implement functionality
test.skip('process replaces current time', () => {
  const processor = new VariablePlaceholderProcessor('de');

  const result = processor.process('<$now: {output: HH-mm}>');

  // TODO: actually such a test should use a static clock with a fixed time instead of the system clock
  expect(result).toMatch(/^[0-9]{2}-[0-9]{2}$/);
});

test('process throws exception on unknown variable placeholder', () => {
  const processor = new VariablePlaceholderProcessor('de');

  expect(() => {
    processor.process('<$unknown>');
  }).toThrow(DataDefinitionError);
});
