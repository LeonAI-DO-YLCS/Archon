/**
 * Database operations for conversation messages (Web UI history)
 */
import { pool, getDialect } from './connection';
import { createLogger } from '@archon/paths';

/** Lazy-initialized logger (deferred so test mocks can intercept createLogger) */
let cachedLog: ReturnType<typeof createLogger> | undefined;
function getLog(): ReturnType<typeof createLogger> {
  if (!cachedLog) cachedLog = createLogger('db.messages');
  return cachedLog;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: string; // JSON string - parsed by frontend
  created_at: string;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
}

const TRANSCRIPT_METADATA_CATEGORIES = new Set([
  'tool_call_formatted',
  'workflow_status',
  'workflow_dispatch_status',
  'workflow_result',
]);

function isReplayableMessage(message: MessageRow): boolean {
  if (!message.content.trim()) {
    return false;
  }

  try {
    const metadata = JSON.parse(message.metadata) as Record<string, unknown>;
    const category = metadata.category;
    if (typeof category === 'string' && TRANSCRIPT_METADATA_CATEGORIES.has(category)) {
      return false;
    }

    if (
      Array.isArray(metadata.toolCalls) ||
      metadata.toolCallId !== undefined ||
      metadata.toolName !== undefined ||
      metadata.toolOutput !== undefined ||
      metadata.workflowDispatch !== undefined ||
      metadata.workflowResult !== undefined
    ) {
      return false;
    }
  } catch {
    // Metadata is best-effort; fall back to including the user-visible message.
  }

  return true;
}

/**
 * Add a message to conversation history.
 * metadata should contain toolCalls array and/or error object if applicable.
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: Record<string, unknown>
): Promise<MessageRow> {
  const dialect = getDialect();
  const result = await pool.query<MessageRow>(
    `INSERT INTO remote_agent_messages (conversation_id, role, content, metadata, created_at)
     VALUES ($1, $2, $3, $4, ${dialect.now()})
     RETURNING *`,
    [conversationId, role, content, JSON.stringify(metadata ?? {})]
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error(
      `Failed to persist message: INSERT returned no rows (conversation: ${conversationId})`
    );
  }
  getLog().debug({ conversationId, role, messageId: row.id }, 'db.message_persist_completed');
  return row;
}

/**
 * List messages for a conversation, oldest first.
 * conversationId is the database UUID (not platform_conversation_id).
 */
export async function listMessages(
  conversationId: string,
  limit = 200
): Promise<readonly MessageRow[]> {
  const result = await pool.query<MessageRow>(
    `SELECT * FROM remote_agent_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows;
}

export async function listReplayTranscript(
  conversationId: string,
  limit = 20
): Promise<readonly TranscriptMessage[]> {
  const result = await pool.query<MessageRow>(
    `SELECT * FROM remote_agent_messages
     WHERE conversation_id = $1
       AND role IN ('user', 'assistant')
     ORDER BY created_at DESC
     LIMIT $2`,
    [conversationId, limit]
  );

  return result.rows
    .slice()
    .reverse()
    .filter(isReplayableMessage)
    .map(message => ({ role: message.role, content: message.content }));
}
