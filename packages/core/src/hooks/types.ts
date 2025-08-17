/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Import types for hook input definitions

export enum HookEventName {
  // Tool Events
  PreToolUse = 'PreToolUse',
  PostToolUse = 'PostToolUse',
  ToolValidationFailure = 'ToolValidationFailure',
  ToolApproval = 'ToolApproval',
  ToolRejection = 'ToolRejection',
  ToolTimeout = 'ToolTimeout',
  ToolCancellation = 'ToolCancellation',
  BatchToolComplete = 'BatchToolComplete',
  
  // Message/Conversation Events
  PreUserMessage = 'PreUserMessage',
  PostUserMessage = 'PostUserMessage',
  PreModelResponse = 'PreModelResponse',
  PostModelResponse = 'PostModelResponse',
  ConversationStart = 'ConversationStart',
  ConversationEnd = 'ConversationEnd',
  MessageReceived = 'MessageReceived',
  MessageSent = 'MessageSent',
  ThoughtGenerated = 'ThoughtGenerated',
  
  // Authentication Events
  AuthenticationStart = 'AuthenticationStart',
  AuthenticationSuccess = 'AuthenticationSuccess',
  AuthenticationFailure = 'AuthenticationFailure',
  TokenRefresh = 'TokenRefresh',
  Logout = 'Logout',
  UnauthorizedAccess = 'UnauthorizedAccess',
  
  // Session Lifecycle Events
  SessionStart = 'SessionStart',
  SessionEnd = 'SessionEnd',
  ChatStart = 'ChatStart',
  ChatReset = 'ChatReset',
  Checkpoint = 'Checkpoint',
  Resume = 'Resume',
  
  // Error Events
  Error = 'Error',
  ApiError = 'ApiError',
  NetworkError = 'NetworkError',
  ValidationError = 'ValidationError',
  TimeoutError = 'TimeoutError',
  UnexpectedError = 'UnexpectedError',
  
  // Model Events
  ModelSwitch = 'ModelSwitch',
  ModelFallback = 'ModelFallback',
  QuotaExceeded = 'QuotaExceeded',
  ModelUnavailable = 'ModelUnavailable',
  
  // Memory/Context Events
  MemorySave = 'MemorySave',
  MemoryLoad = 'MemoryLoad',
  MemoryRefresh = 'MemoryRefresh',
  ContextCompress = 'ContextCompress',
  ContextExpand = 'ContextExpand',
  MemoryImport = 'MemoryImport',
  MemoryExport = 'MemoryExport',
  
  // IDE Integration Events
  IdeConnect = 'IdeConnect',
  IdeDisconnect = 'IdeDisconnect',
  FileOpen = 'FileOpen',
  FileClose = 'FileClose',
  CursorMove = 'CursorMove',
  SelectionChange = 'SelectionChange',
  FileChange = 'FileChange',
  
  // MCP Server Events
  McpServerConnect = 'McpServerConnect',
  McpServerDisconnect = 'McpServerDisconnect',
  McpServerError = 'McpServerError',
  McpToolDiscovered = 'McpToolDiscovered',
  McpPromptDiscovered = 'McpPromptDiscovered',
  McpOAuthStart = 'McpOAuthStart',
  McpOAuthComplete = 'McpOAuthComplete',
  
  // File Operation Events
  FileRead = 'FileRead',
  FileWrite = 'FileWrite',
  FileEdit = 'FileEdit',
  FileDelete = 'FileDelete',
  DirectoryList = 'DirectoryList',
  FileSearch = 'FileSearch',
  
  // Approval/Permission Events
  ApprovalRequested = 'ApprovalRequested',
  ApprovalGranted = 'ApprovalGranted',
  ApprovalDenied = 'ApprovalDenied',
  PermissionCheck = 'PermissionCheck',
  TrustDecision = 'TrustDecision',
  
  // Existing Events (keeping for compatibility)
  Notification = 'Notification',
  Stop = 'Stop',
  SubagentStop = 'SubagentStop',
  PreCompact = 'PreCompact',
}

export interface BaseHookInput {
  session_id: string;
  transcript_path?: string;
  hook_event_name: HookEventName;
  agent_type: string;
  cwd: string;
  metadata?: {
    timestamp: number;
    user?: string;
    hostname?: string;
    platform?: string;
    nodeVersion?: string;
  };
}

export interface PreToolUseHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PreToolUse;
  tool_name: string;
  tool_input: Record<string, unknown>;
}

export interface PostToolUseHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PostToolUse;
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_response: {
    output?: string;
    error?: string;
  };
}

export interface NotificationHookInput extends BaseHookInput {
  hook_event_name: HookEventName.Notification;
  notification_type: 'permission_request' | 'idle';
  message?: string;
}

export interface StopHookInput extends BaseHookInput {
  hook_event_name: HookEventName.Stop;
  final_message?: string;
}

export interface SubagentStopHookInput extends BaseHookInput {
  hook_event_name: HookEventName.SubagentStop;
  subagent_name: string;
  final_message?: string;
}

export interface PreCompactHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PreCompact;
  current_token_count: number;
  max_token_count: number;
}

// Tool Event Inputs
export interface ToolValidationFailureHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ToolValidationFailure;
  tool_name: string;
  validation_error: string;
  tool_input: Record<string, unknown>;
}

export interface ToolApprovalHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ToolApproval;
  tool_name: string;
  tool_input: Record<string, unknown>;
  approval_mode: string;
}

export interface ToolRejectionHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ToolRejection;
  tool_name: string;
  tool_input: Record<string, unknown>;
  rejection_reason?: string;
}

export interface ToolTimeoutHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ToolTimeout;
  tool_name: string;
  timeout_ms: number;
}

export interface ToolCancellationHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ToolCancellation;
  tool_name: string;
  cancellation_reason?: string;
}

export interface BatchToolCompleteHookInput extends BaseHookInput {
  hook_event_name: HookEventName.BatchToolComplete;
  tools_executed: string[];
  results_count: number;
}

// Message/Conversation Event Inputs
export interface PreUserMessageHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PreUserMessage;
  message: string;
  attachments?: string[];
}

export interface PostUserMessageHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PostUserMessage;
  message: string;
  processed: boolean;
}

export interface PreModelResponseHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PreModelResponse;
  model: string;
  context_length: number;
}

export interface PostModelResponseHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PostModelResponse;
  model: string;
  response: string;
  tool_calls?: string[];
  tokens_used?: number;
}

export interface ConversationStartHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ConversationStart;
  initial_message?: string;
}

export interface ConversationEndHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ConversationEnd;
  reason: string;
  final_message?: string;
}

export interface MessageReceivedHookInput extends BaseHookInput {
  hook_event_name: HookEventName.MessageReceived;
  sender: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MessageSentHookInput extends BaseHookInput {
  hook_event_name: HookEventName.MessageSent;
  recipient: 'user' | 'model' | 'system';
  content: string;
}

export interface ThoughtGeneratedHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ThoughtGenerated;
  thought: string;
}

// Authentication Event Inputs
export interface AuthenticationStartHookInput extends BaseHookInput {
  hook_event_name: HookEventName.AuthenticationStart;
  auth_method: string;
}

export interface AuthenticationSuccessHookInput extends BaseHookInput {
  hook_event_name: HookEventName.AuthenticationSuccess;
  auth_method: string;
  user_id?: string;
}

export interface AuthenticationFailureHookInput extends BaseHookInput {
  hook_event_name: HookEventName.AuthenticationFailure;
  auth_method: string;
  error: string;
}

export interface TokenRefreshHookInput extends BaseHookInput {
  hook_event_name: HookEventName.TokenRefresh;
  token_type: string;
  success: boolean;
}

export interface LogoutHookInput extends BaseHookInput {
  hook_event_name: HookEventName.Logout;
  user_id?: string;
}

export interface UnauthorizedAccessHookInput extends BaseHookInput {
  hook_event_name: HookEventName.UnauthorizedAccess;
  resource: string;
  status_code: number;
}

// Session Lifecycle Event Inputs
export interface SessionStartHookInput extends BaseHookInput {
  hook_event_name: HookEventName.SessionStart;
  mode: string;
  working_directory: string;
}

export interface SessionEndHookInput extends BaseHookInput {
  hook_event_name: HookEventName.SessionEnd;
  duration_ms: number;
  exit_code: number;
}

export interface ChatStartHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ChatStart;
  model: string;
}

export interface ChatResetHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ChatReset;
  reason: string;
}

export interface CheckpointHookInput extends BaseHookInput {
  hook_event_name: HookEventName.Checkpoint;
  checkpoint_id: string;
  message_count: number;
}

export interface ResumeHookInput extends BaseHookInput {
  hook_event_name: HookEventName.Resume;
  checkpoint_id: string;
  conversation_id?: string;
}

// Error Event Inputs
export interface ErrorHookInput extends BaseHookInput {
  hook_event_name: HookEventName.Error;
  error_type: string;
  error_message: string;
  stack_trace?: string;
}

export interface ApiErrorHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ApiError;
  status_code: number;
  error_message: string;
  endpoint?: string;
}

export interface NetworkErrorHookInput extends BaseHookInput {
  hook_event_name: HookEventName.NetworkError;
  error_message: string;
  url?: string;
}

export interface ValidationErrorHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ValidationError;
  field?: string;
  error_message: string;
}

export interface TimeoutErrorHookInput extends BaseHookInput {
  hook_event_name: HookEventName.TimeoutError;
  operation: string;
  timeout_ms: number;
}

export interface UnexpectedErrorHookInput extends BaseHookInput {
  hook_event_name: HookEventName.UnexpectedError;
  error_message: string;
  context?: string;
}

// Model Event Inputs
export interface ModelSwitchHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ModelSwitch;
  from_model: string;
  to_model: string;
  reason?: string;
}

export interface ModelFallbackHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ModelFallback;
  primary_model: string;
  fallback_model: string;
  error?: string;
}

export interface QuotaExceededHookInput extends BaseHookInput {
  hook_event_name: HookEventName.QuotaExceeded;
  model: string;
  quota_type: string;
}

export interface ModelUnavailableHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ModelUnavailable;
  model: string;
  reason?: string;
}

// Memory/Context Event Inputs
export interface MemorySaveHookInput extends BaseHookInput {
  hook_event_name: HookEventName.MemorySave;
  memory_type: string;
  size_bytes?: number;
}

export interface MemoryLoadHookInput extends BaseHookInput {
  hook_event_name: HookEventName.MemoryLoad;
  memory_type: string;
  source: string;
}

export interface MemoryRefreshHookInput extends BaseHookInput {
  hook_event_name: HookEventName.MemoryRefresh;
  files_count: number;
}

export interface ContextCompressHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ContextCompress;
  before_tokens: number;
  after_tokens: number;
}

export interface ContextExpandHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ContextExpand;
  expanded_by: number;
}

export interface MemoryImportHookInput extends BaseHookInput {
  hook_event_name: HookEventName.MemoryImport;
  source: string;
  items_count: number;
}

export interface MemoryExportHookInput extends BaseHookInput {
  hook_event_name: HookEventName.MemoryExport;
  destination: string;
  items_count: number;
}

// IDE Integration Event Inputs
export interface IdeConnectHookInput extends BaseHookInput {
  hook_event_name: HookEventName.IdeConnect;
  ide_name: string;
  ide_version?: string;
}

export interface IdeDisconnectHookInput extends BaseHookInput {
  hook_event_name: HookEventName.IdeDisconnect;
  ide_name: string;
  reason?: string;
}

export interface FileOpenHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileOpen;
  file_path: string;
  file_type?: string;
}

export interface FileCloseHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileClose;
  file_path: string;
}

export interface CursorMoveHookInput extends BaseHookInput {
  hook_event_name: HookEventName.CursorMove;
  file_path: string;
  line: number;
  column: number;
}

export interface SelectionChangeHookInput extends BaseHookInput {
  hook_event_name: HookEventName.SelectionChange;
  file_path: string;
  selection_text?: string;
  selection_range?: { start: number; end: number };
}

export interface FileChangeHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileChange;
  file_path: string;
  change_type: 'add' | 'modify' | 'delete';
}

// MCP Server Event Inputs
export interface McpServerConnectHookInput extends BaseHookInput {
  hook_event_name: HookEventName.McpServerConnect;
  server_name: string;
  transport_type: string;
}

export interface McpServerDisconnectHookInput extends BaseHookInput {
  hook_event_name: HookEventName.McpServerDisconnect;
  server_name: string;
  reason?: string;
}

export interface McpServerErrorHookInput extends BaseHookInput {
  hook_event_name: HookEventName.McpServerError;
  server_name: string;
  error_message: string;
}

export interface McpToolDiscoveredHookInput extends BaseHookInput {
  hook_event_name: HookEventName.McpToolDiscovered;
  server_name: string;
  tool_name: string;
  tool_description?: string;
}

export interface McpPromptDiscoveredHookInput extends BaseHookInput {
  hook_event_name: HookEventName.McpPromptDiscovered;
  server_name: string;
  prompt_name: string;
  prompt_description?: string;
}

export interface McpOAuthStartHookInput extends BaseHookInput {
  hook_event_name: HookEventName.McpOAuthStart;
  server_name: string;
  provider: string;
}

export interface McpOAuthCompleteHookInput extends BaseHookInput {
  hook_event_name: HookEventName.McpOAuthComplete;
  server_name: string;
  success: boolean;
}

// File Operation Event Inputs
export interface FileReadHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileRead;
  file_path: string;
  size_bytes?: number;
}

export interface FileWriteHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileWrite;
  file_path: string;
  size_bytes?: number;
  overwrite: boolean;
}

export interface FileEditHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileEdit;
  file_path: string;
  edits_count: number;
}

export interface FileDeleteHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileDelete;
  file_path: string;
}

export interface DirectoryListHookInput extends BaseHookInput {
  hook_event_name: HookEventName.DirectoryList;
  directory_path: string;
  items_count: number;
}

export interface FileSearchHookInput extends BaseHookInput {
  hook_event_name: HookEventName.FileSearch;
  search_pattern: string;
  search_type: 'glob' | 'grep' | 'find';
  results_count?: number;
}

// Approval/Permission Event Inputs
export interface ApprovalRequestedHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ApprovalRequested;
  approval_type: string;
  resource: string;
  details?: string;
}

export interface ApprovalGrantedHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ApprovalGranted;
  approval_type: string;
  resource: string;
  granted_by?: string;
}

export interface ApprovalDeniedHookInput extends BaseHookInput {
  hook_event_name: HookEventName.ApprovalDenied;
  approval_type: string;
  resource: string;
  denied_by?: string;
  reason?: string;
}

export interface PermissionCheckHookInput extends BaseHookInput {
  hook_event_name: HookEventName.PermissionCheck;
  permission: string;
  resource: string;
  result: boolean;
}

export interface TrustDecisionHookInput extends BaseHookInput {
  hook_event_name: HookEventName.TrustDecision;
  resource: string;
  trusted: boolean;
  trust_level?: string;
}

export type HookInput =
  // Tool Events
  | PreToolUseHookInput
  | PostToolUseHookInput
  | ToolValidationFailureHookInput
  | ToolApprovalHookInput
  | ToolRejectionHookInput
  | ToolTimeoutHookInput
  | ToolCancellationHookInput
  | BatchToolCompleteHookInput
  // Message/Conversation Events
  | PreUserMessageHookInput
  | PostUserMessageHookInput
  | PreModelResponseHookInput
  | PostModelResponseHookInput
  | ConversationStartHookInput
  | ConversationEndHookInput
  | MessageReceivedHookInput
  | MessageSentHookInput
  | ThoughtGeneratedHookInput
  // Authentication Events
  | AuthenticationStartHookInput
  | AuthenticationSuccessHookInput
  | AuthenticationFailureHookInput
  | TokenRefreshHookInput
  | LogoutHookInput
  | UnauthorizedAccessHookInput
  // Session Lifecycle Events
  | SessionStartHookInput
  | SessionEndHookInput
  | ChatStartHookInput
  | ChatResetHookInput
  | CheckpointHookInput
  | ResumeHookInput
  // Error Events
  | ErrorHookInput
  | ApiErrorHookInput
  | NetworkErrorHookInput
  | ValidationErrorHookInput
  | TimeoutErrorHookInput
  | UnexpectedErrorHookInput
  // Model Events
  | ModelSwitchHookInput
  | ModelFallbackHookInput
  | QuotaExceededHookInput
  | ModelUnavailableHookInput
  // Memory/Context Events
  | MemorySaveHookInput
  | MemoryLoadHookInput
  | MemoryRefreshHookInput
  | ContextCompressHookInput
  | ContextExpandHookInput
  | MemoryImportHookInput
  | MemoryExportHookInput
  // IDE Integration Events
  | IdeConnectHookInput
  | IdeDisconnectHookInput
  | FileOpenHookInput
  | FileCloseHookInput
  | CursorMoveHookInput
  | SelectionChangeHookInput
  | FileChangeHookInput
  // MCP Server Events
  | McpServerConnectHookInput
  | McpServerDisconnectHookInput
  | McpServerErrorHookInput
  | McpToolDiscoveredHookInput
  | McpPromptDiscoveredHookInput
  | McpOAuthStartHookInput
  | McpOAuthCompleteHookInput
  // File Operation Events
  | FileReadHookInput
  | FileWriteHookInput
  | FileEditHookInput
  | FileDeleteHookInput
  | DirectoryListHookInput
  | FileSearchHookInput
  // Approval/Permission Events
  | ApprovalRequestedHookInput
  | ApprovalGrantedHookInput
  | ApprovalDeniedHookInput
  | PermissionCheckHookInput
  | TrustDecisionHookInput
  // Existing Events (for compatibility)
  | NotificationHookInput
  | StopHookInput
  | SubagentStopHookInput
  | PreCompactHookInput;

export interface HookOutput {
  continue?: boolean;
  stopReason?: string;
  suppressOutput?: boolean;
}

export interface HookExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  output?: HookOutput;
}

export enum HookExecutionOutcome {
  Success = 'success',
  BlockingError = 'blockingError',
  NonBlockingError = 'nonBlockingError',
  Timeout = 'timeout',
}

export interface HookConfig {
  type: 'command';
  command: string;
  timeout?: number;
}

export interface HookMatcher {
  matcher?: string;
  hooks: HookConfig[];
}

export interface HooksConfiguration {
  // Tool Events
  PreToolUse?: HookMatcher[];
  PostToolUse?: HookMatcher[];
  ToolValidationFailure?: HookMatcher[];
  ToolApproval?: HookMatcher[];
  ToolRejection?: HookMatcher[];
  ToolTimeout?: HookMatcher[];
  ToolCancellation?: HookMatcher[];
  BatchToolComplete?: HookMatcher[];
  
  // Message/Conversation Events
  PreUserMessage?: HookMatcher[];
  PostUserMessage?: HookMatcher[];
  PreModelResponse?: HookMatcher[];
  PostModelResponse?: HookMatcher[];
  ConversationStart?: HookMatcher[];
  ConversationEnd?: HookMatcher[];
  MessageReceived?: HookMatcher[];
  MessageSent?: HookMatcher[];
  ThoughtGenerated?: HookMatcher[];
  
  // Authentication Events
  AuthenticationStart?: HookMatcher[];
  AuthenticationSuccess?: HookMatcher[];
  AuthenticationFailure?: HookMatcher[];
  TokenRefresh?: HookMatcher[];
  Logout?: HookMatcher[];
  UnauthorizedAccess?: HookMatcher[];
  
  // Session Lifecycle Events
  SessionStart?: HookMatcher[];
  SessionEnd?: HookMatcher[];
  ChatStart?: HookMatcher[];
  ChatReset?: HookMatcher[];
  Checkpoint?: HookMatcher[];
  Resume?: HookMatcher[];
  
  // Error Events
  Error?: HookMatcher[];
  ApiError?: HookMatcher[];
  NetworkError?: HookMatcher[];
  ValidationError?: HookMatcher[];
  TimeoutError?: HookMatcher[];
  UnexpectedError?: HookMatcher[];
  
  // Model Events
  ModelSwitch?: HookMatcher[];
  ModelFallback?: HookMatcher[];
  QuotaExceeded?: HookMatcher[];
  ModelUnavailable?: HookMatcher[];
  
  // Memory/Context Events
  MemorySave?: HookMatcher[];
  MemoryLoad?: HookMatcher[];
  MemoryRefresh?: HookMatcher[];
  ContextCompress?: HookMatcher[];
  ContextExpand?: HookMatcher[];
  MemoryImport?: HookMatcher[];
  MemoryExport?: HookMatcher[];
  
  // IDE Integration Events
  IdeConnect?: HookMatcher[];
  IdeDisconnect?: HookMatcher[];
  FileOpen?: HookMatcher[];
  FileClose?: HookMatcher[];
  CursorMove?: HookMatcher[];
  SelectionChange?: HookMatcher[];
  FileChange?: HookMatcher[];
  
  // MCP Server Events
  McpServerConnect?: HookMatcher[];
  McpServerDisconnect?: HookMatcher[];
  McpServerError?: HookMatcher[];
  McpToolDiscovered?: HookMatcher[];
  McpPromptDiscovered?: HookMatcher[];
  McpOAuthStart?: HookMatcher[];
  McpOAuthComplete?: HookMatcher[];
  
  // File Operation Events
  FileRead?: HookMatcher[];
  FileWrite?: HookMatcher[];
  FileEdit?: HookMatcher[];
  FileDelete?: HookMatcher[];
  DirectoryList?: HookMatcher[];
  FileSearch?: HookMatcher[];
  
  // Approval/Permission Events
  ApprovalRequested?: HookMatcher[];
  ApprovalGranted?: HookMatcher[];
  ApprovalDenied?: HookMatcher[];
  PermissionCheck?: HookMatcher[];
  TrustDecision?: HookMatcher[];
  
  // Existing Events (for compatibility)
  Notification?: HookMatcher[];
  Stop?: HookMatcher[];
  SubagentStop?: HookMatcher[];
  PreCompact?: HookMatcher[];
}