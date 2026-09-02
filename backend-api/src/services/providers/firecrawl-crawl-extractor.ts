import { Firecrawl } from 'firecrawl';
import { WebContentExtractor, ExtractedWebContent } from './web-content-extractor.interface';
import appConfig from '../../config/config';
import Logger from '../../config/logger';

export class FirecrawlCrawlExtractor implements WebContentExtractor {
  private readonly client: Firecrawl;

  constructor() {
    const { apiKey } = appConfig.firecrawl;

    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not configured. Cannot initialize FirecrawlCrawlExtractor.');
    }

    this.client = new Firecrawl({ apiKey });
  }

  async extract(url: string): Promise<ExtractedWebContent> {
    Logger.info(`FirecrawlCrawlExtractor: Initiating crawl for ${url}`);

    try {
      const crawlStart = Date.now();
      
      const job: any = await this.client.crawl(url, {
        limit: 10,
        pollInterval: 2,
        timeout: 120,
        scrapeOptions: {
          formats: ['markdown'],
        }
      });

      const elapsed = ((Date.now() - crawlStart) / 1000).toFixed(1);
      Logger.info(`FirecrawlCrawlExtractor: Crawl API returned after ${elapsed}s. Success: ${job?.success}, Status: ${job?.status}, Items: ${job?.data?.length}`);

      if (!job || !job.success || !job.data || job.data.length === 0) {
        Logger.error(`Firecrawl returned no extractable content. Job data: ` + JSON.stringify(job));
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
      Logger.error(`FirecrawlCrawlExtractor error: ${error.message}`);
      throw error;
    }
  }
}
