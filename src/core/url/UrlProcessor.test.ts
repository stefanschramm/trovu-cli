import { UrlProcessor } from './UrlProcessor.js';

test('process replaces argument placeholders', () => {
  const urlProcessor = new UrlProcessor('de');

  const result = urlProcessor.process(
    'https://www.bvg.de/de/verbindungen/verbindungssuche?S=<Start>&Z=<Ziel>&start=1',
    ['Alexanderplatz', 'Hermannplatz'],
  );

  expect(result).toEqual('https://www.bvg.de/de/verbindungen/verbindungssuche?S=Alexanderplatz&Z=Hermannplatz&start=1');
});

test('process replaces variable placeholder', () => {
  const urlProcessor = new UrlProcessor('en');

  const result = urlProcessor.process(
    'https://<$language>.wikipedia.org/wiki/Special:Search?go=Article&search=<article>',
    ['Berlin'],
  );

  expect(result).toEqual('https://en.wikipedia.org/wiki/Special:Search?go=Article&search=Berlin');
});
