import { inngestClient } from '../services/queue/inngest.client';
import { SourceIngestionProcessor } from './ingestion.processor';

export const processSourceJob = inngestClient.createFunction(
  { 
    id: 'ingest-source', 
    name: 'Ingest Document Source',
    triggers: [{ event: 'source/ingest' }],
    retries: 3
  },
  async ({ event, step }) => {
    const { workspaceId, sourceId, sync } = event.data as any;

    await step.run('process-source', async () => {
      await SourceIngestionProcessor.processSource(workspaceId, sourceId, !!sync);
    });

    return { success: true, sourceId };
  }
);
