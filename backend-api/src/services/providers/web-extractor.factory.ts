import { WebContentExtractor } from './web-content-extractor.interface';
import { FirecrawlExtractor } from './firecrawl-extractor';
import { JinaExtractor } from './jina-extractor';
import appConfig from '../../config/config';
import Logger from '../../config/logger';

export type WebExtractorProvider = 'firecrawl' | 'jina';

export class WebExtractorFactory {
  static create(): WebContentExtractor {
    const provider: WebExtractorProvider = appConfig.webExtractor.provider;

    Logger.info(`WebExtractorFactory: Using '${provider}' web content extractor`);

    switch (provider) {
      case 'jina':
        return new JinaExtractor();
      case 'firecrawl':
        return new FirecrawlExtractor();
      default: {
        Logger.warn(`WebExtractorFactory: Unknown provider '${provider}', falling back to 'firecrawl'`);
        return new FirecrawlExtractor();
      }
    }
  }
}
