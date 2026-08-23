import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import SourceDao from '../dao/source.dao';
import filebaseStorageService from '../services/filebase-storage.service';
import { PDFParser } from '../services/parsers/pdf.parser';
import { WebParser } from '../services/parsers/web.parser';
import { YouTubeParser } from '../services/parsers/youtube.parser';
import { SubtitleParser } from '../services/parsers/subtitle.parser';
import { TextParser } from '../services/parsers/text.parser';
import { MarkdownParser } from '../services/parsers/markdown.parser';
import { validateUrlForSsrf } from '../utils/url-validator';
import { ChunkingService } from '../services/chunking/chunking.service';
import { EmbeddingService } from '../services/embeddings/embedding.service';
import qdrantService from '../services/qdrant/qdrant.service';
import Logger from '../config/logger';

const CHUNK_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

export class SourceIngestionProcessor {
  static async processSource(workspaceId: string, sourceId: string, isSync: boolean = false) {
    const ingestionId = uuidv4();
    try {
      const source = await SourceDao.findSourceByIdAndWorkspace(sourceId, workspaceId);
      if (!source) {
        throw new Error(`Source not found: ${sourceId}`);
      }

      Logger.info(`Starting ingestion for source ${sourceId} (type: ${source.type}, sync: ${isSync}, ingestionId: ${ingestionId})`);

      if (!isSync) {
        await SourceDao.updateSourceStatus(sourceId, workspaceId, 'PARSING');
      }

      let fileBuffer: Buffer;

      if (source.type === 'website' || source.type === 'youtube') {
        const url = source.originalUrl || source.metadata?.url;
        if (!url) {
          throw new Error(`Source ${sourceId} has no URL`);
        }

        if (source.type === 'website') {
          const validation = validateUrlForSsrf(url);
          if (!validation.valid) {
            throw new Error(`URL validation failed: ${validation.error}`);
          }
        }

        fileBuffer = Buffer.from(url, 'utf-8');
      } else {
        if (!source.storageKey) {
          throw new Error('Source has no storage key');
        }
        fileBuffer = await filebaseStorageService.downloadFile(source.storageKey);
      }

      let parsedDoc;
      switch (source.type) {
        case 'pdf': {
          const parser = new PDFParser();
          parsedDoc = await parser.parse(fileBuffer);
          break;
        }
        case 'website': {
          const parser = new WebParser();
          parsedDoc = await parser.parse(fileBuffer);
          break;
        }
        case 'youtube': {
          const parser = new YouTubeParser();
          parsedDoc = await parser.parse(fileBuffer);
          break;
        }
        case 'vtt': {
          const parser = new SubtitleParser('vtt');
          parsedDoc = await parser.parse(fileBuffer);
          break;
        }
        case 'srt': {
          const parser = new SubtitleParser('srt');
          parsedDoc = await parser.parse(fileBuffer);
          break;
        }
        case 'txt': {
          const parser = new TextParser();
          parsedDoc = await parser.parse(fileBuffer);
          break;
        }
        case 'markdown': {
          const parser = new MarkdownParser();
          parsedDoc = await parser.parse(fileBuffer);
          break;
        }
        default:
          throw new Error(`Unsupported source type for ingestion: ${source.type}`);
      }

      if (!isSync) {
        await SourceDao.updateSourceStatus(sourceId, workspaceId, 'CHUNKING', parsedDoc.metadata);
      }

      const chunks = ChunkingService.chunkSections(parsedDoc.sections, {
        sourceId,
        workspaceId,
        sourceType: source.type,
      });

      if (chunks.length === 0) {
        throw new Error('No text chunks could be generated from the document');
      }

      Logger.info(`Generated ${chunks.length} chunks for source ${sourceId}`);
      if (!isSync) {
        await SourceDao.updateSourceStatus(sourceId, workspaceId, 'EMBEDDING');
      }

      const texts = chunks.map(c => c.text);
      const embeddings = await EmbeddingService.generateEmbeddingsBatch(texts);

      const points = chunks.map((chunk, i) => {
        const pointId = uuidv5(`${sourceId}_${ingestionId}_chunk_${chunk.metadata.chunkIndex}`, CHUNK_NAMESPACE);
        
        return {
          id: pointId,
          vector: embeddings[i],
          payload: {
            workspaceId,
            sourceId,
            ingestionId,
            sourceType: source.type,
            text: chunk.text,
            ...chunk.metadata
          }
        };
      });

      await qdrantService.upsertChunks(points);

      await qdrantService.deleteOldIngestions(workspaceId, sourceId, ingestionId);

      const updatedMetadata = {
        ...(source.metadata || {}),
        ...(parsedDoc?.metadata || {}),
        activeIngestionId: ingestionId,
        lastSyncError: null,
      };

      await SourceDao.updateSourceStatus(sourceId, workspaceId, 'READY', updatedMetadata);
      Logger.info(`Successfully completed ingestion for source ${sourceId} (ingestionId: ${ingestionId})`);

    } catch (error: any) {
      Logger.error(`Ingestion failed for source ${sourceId}: ${error.message}`);
      
      const source = await SourceDao.findSourceByIdAndWorkspace(sourceId, workspaceId);
      if (isSync && source && source.status === 'READY') {
        await SourceDao.updateSourceStatus(sourceId, workspaceId, 'READY', {
          ...(source.metadata || {}),
          lastSyncError: error.message
        });
      } else {
        await SourceDao.updateSourceStatus(sourceId, workspaceId, 'FAILED', {
          ...(source?.metadata || {}),
          error: error.message
        });
      }

      await qdrantService.deleteOldIngestions(workspaceId, sourceId, source?.metadata?.activeIngestionId || 'none');
      if (error.message.includes('Embedding API error') || error.message.includes('Qdrant')) {
        throw error;
      }
    }
  }
}
