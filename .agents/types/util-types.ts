// ===== JSON Types =====
type JSONValue = null | string | number | boolean | JSONObject | JSONArray;

type JSONObject = { [key: string]: JSONValue };

type JSONArray = JSONValue[];

/**
 * JSON Schema definition (for prompt schema or output schema)
 */
type JsonSchema = {
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'integer';
  description?: string;
  properties?: Record<string, JsonSchema | boolean>;
  required?: string[];
  enum?: Array<string | number | boolean | null>;
  [k: string]: unknown;
};
type JsonObjectSchema = JsonSchema & { type: 'object' };

// ===== Data Content Types =====
type DataContent = string | Uint8Array | ArrayBuffer | Buffer;

// ===== Provider Metadata Types =====
type ProviderMetadata = Record<string, Record<string, JSONValue>>;

// ===== Content Part Types =====
export type TextPart = {
  type: 'text';
  text: string;
  providerOptions?: ProviderMetadata;
};

export type ImagePart = {
  type: 'image';
  image: DataContent;
  mediaType?: string;
  providerOptions?: ProviderMetadata;
};

export type FilePart = {
  type: 'file';
  data: DataContent;
  filename?: string;
  mediaType: string;
  providerOptions?: ProviderMetadata;
};

type ReasoningPart = {
  type: 'reasoning';
  text: string;
  providerOptions?: ProviderMetadata;
};

type ToolCallPart = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
  providerOptions?: ProviderMetadata;
  providerExecuted?: boolean;
};

type ToolResultOutput =
  | {
      type: 'json';
      value: JSONValue;
    }
  | {
      type: 'media';
      data: string;
      mediaType: string;
    };

// ===== Message Types =====
type AuxiliaryMessageData = {
  providerOptions?: ProviderMetadata;
  tags?: string[];

  /** @deprecated Use tags instead. */
  timeToLive?: 'agentStep' | 'userPrompt';
  /** @deprecated Use tags instead. */
  keepDuringTruncation?: boolean;
  /** @deprecated Use tags instead. */
  keepLastTags?: string[];
};

type SystemMessage = {
  role: 'system';
  content: TextPart[];
} & AuxiliaryMessageData;

type UserMessage = {
  role: 'user';
  content: (TextPart | ImagePart | FilePart)[];
} & AuxiliaryMessageData;

type AssistantMessage = {
  role: 'assistant';
  content: (TextPart | ReasoningPart | ToolCallPart)[];
} & AuxiliaryMessageData;

type ToolMessage = {
  role: 'tool';
  toolCallId: string;
  toolName: string;
  content: ToolResultOutput[];
} & AuxiliaryMessageData;

export type Message = SystemMessage | UserMessage | AssistantMessage | ToolMessage;

// ===== MCP Server Types =====

/**
 * MCP server configuration for stdio-based servers.
 *
 * Environment variables in `env` can be:
 * - A plain string value (hardcoded, e.g., `'production'`)
 * - A `$VAR_NAME` reference to read from local environment (e.g., `'$NOTION_TOKEN'`)
 *
 * The `$VAR_NAME` syntax reads from `process.env.VAR_NAME` at agent load time.
 * This keeps secrets out of your agent definitions - store them in `.env.local` instead.
 *
 * @example
 * ```typescript
 * env: {
 *   // Read NOTION_TOKEN from local .env file
 *   NOTION_TOKEN: '$NOTION_TOKEN',
 *   // Read MY_API_KEY from local env, pass as API_KEY to MCP server
 *   API_KEY: '$MY_API_KEY',
 *   // Hardcoded value (non-secret)
 *   NODE_ENV: 'production',
 * }
 * ```
 */
type MCPConfig =
  | {
      type?: 'stdio';
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  | {
      type?: 'http' | 'sse';
      url: string;
      params?: Record<string, string>;
      headers?: Record<string, string>;
    };

// ============================================================================
// Logger Interface
// ============================================================================
export interface Logger {
  debug: (data: unknown, msg?: string) => void;
  info: (data: unknown, msg?: string) => void;
  warn: (data: unknown, msg?: string) => void;
  error: (data: unknown, msg?: string) => void;
}
