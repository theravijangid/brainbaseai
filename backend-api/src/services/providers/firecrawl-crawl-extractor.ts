import { Firecrawl } from 'firecrawl';
import { WebContentExtractor, ExtractedWebContent } from './web-content-extractor.interface';
import appConfig from '../../config/config';
import Logger from '../../config/logger';

export class FirecrawlCrawlExtractor implements WebContentExtractor {
  private readonly client: Firecrawl;
  private readonly timeoutMs: number;

  constructor() {
    const { apiKey } = appConfig.firecrawl;

    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not configured. Cannot initialize FirecrawlCrawlExtractor.');
    }

    this.client = new Firecrawl({ apiKey });
    this.timeoutMs = 120000; // Increased to 2 minutes for crawling
  }

  async extract(url: string): Promise<ExtractedWebContent> {
    Logger.info(`FirecrawlCrawlExtractor: Crawling content from ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const job: any = await this.client.crawl(url, {
        limit: 10,
        pollInterval: 2000,
        timeout: this.timeoutMs,
        scrapeOptions: {
          formats: ['markdown'],
        }
      });

      if (!job || !job.success || !job.data || job.data.length === 0) {
        throw new Error('Firecrawl returned no extractable content from the URL');
      }

      let combinedMarkdown = '';
      let mainTitle = '';
      
      for (const page of job.data) {
        if (page.markdown) {
          combinedMarkdown += page.markdown + '\n\n---\n\n';
        }
        if (!mainTitle && page.metadata?.title) {
          mainTitle = page.metadata.title;
        }
      }

      if (!combinedMarkdown || combinedMarkdown.trim().length === 0) {
        throw new Error('Firecrawl crawl returned empty markdown for all pages');
      }

      Logger.info(`FirecrawlCrawlExtractor: Extracted ${combinedMarkdown.length} chars from ${job.data.length} pages starting at ${url}`);

      return {
        title: mainTitle || 'Crawled Site',
        content: combinedMarkdown,
        url: url,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Firecrawl request timed out after ${this.timeoutMs}ms for URL: ${url}`);
      }
      Logger.error(`FirecrawlCrawlExtractor error: ${error.message}`);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
