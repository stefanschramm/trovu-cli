import { DataDefinitionError } from '../../Error.js';

export class VariablePlaceholderProcessor {
  public constructor(private readonly language: string) {}

  public process(placeholder: string): string {
    if (placeholder === '<$language>') {
      return this.language;
    }

    // TODO: <$now ...>

    throw new DataDefinitionError(`Encountered invalid variable placeholder: "${placeholder}"`);
  }
}
