export interface IngestionJobPayload {
  workspaceId: string;
  sourceId: string;
  sync?: boolean;
}

export interface IngestionQueue {
  enqueueSource(payload: IngestionJobPayload): Promise<void>;
}
