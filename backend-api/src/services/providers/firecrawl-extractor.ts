import { Firecrawl } from 'firecrawl';
import { WebContentExtractor, ExtractedWebContent } from './web-content-extractor.interface';
import appConfig from '../../config/config';
import Logger from '../../config/logger';

export class FirecrawlExtractor implements WebContentExtractor {
  private readonly client: Firecrawl;
  private readonly timeoutMs: number;

  constructor() {
    const { apiKey, timeoutMs } = appConfig.firecrawl;

    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not configured. Cannot initialize FirecrawlExtractor.');
    }

    this.client = new Firecrawl({ apiKey });
    this.timeoutMs = timeoutMs;
  }

  async extract(url: string): Promise<ExtractedWebContent> {
    Logger.info(`FirecrawlExtractor: Scraping content from ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const result = await this.client.scrape(url, {
        formats: ['markdown', 'html'],
      });

      const markdown = result.markdown ?? '';
      const title = result.metadata?.title ?? '';
      const sourceUrl = result.metadata?.sourceURL ?? url;

      if (!markdown || markdown.trim().length === 0) {
        throw new Error('Firecrawl returned no extractable content from the URL');
      }

      Logger.info(`FirecrawlExtractor: Extracted ${markdown.length} chars from ${url}`);

      return {
        title,
        content: markdown,
        url: sourceUrl,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Firecrawl request timed out after ${this.timeoutMs}ms for URL: ${url}`);
      }
      Logger.error(`FirecrawlExtractor error: ${error.message}`);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
