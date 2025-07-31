/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { HooksManager, HookExecutionContext } from './HooksManager.js';
import {
  HookEventName,
  HookExecutionResult,
  // Tool Events
  ToolValidationFailureHookInput,
  ToolApprovalHookInput,
  ToolRejectionHookInput,
  ToolTimeoutHookInput,
  ToolCancellationHookInput,
  BatchToolCompleteHookInput,
  // Message Events
  PreUserMessageHookInput,
  PostUserMessageHookInput,
  PreModelResponseHookInput,
  PostModelResponseHookInput,
  ConversationStartHookInput,
  ConversationEndHookInput,
  MessageReceivedHookInput,
  MessageSentHookInput,
  ThoughtGeneratedHookInput,
  // Auth Events
  AuthenticationStartHookInput,
  AuthenticationSuccessHookInput,
  AuthenticationFailureHookInput,
  TokenRefreshHookInput,
  LogoutHookInput,
  UnauthorizedAccessHookInput,
  // Session Events
  SessionStartHookInput,
  SessionEndHookInput,
  ChatStartHookInput,
  ChatResetHookInput,
  CheckpointHookInput,
  ResumeHookInput,
  // Error Events
  ErrorHookInput,
  ApiErrorHookInput,
  NetworkErrorHookInput,
  ValidationErrorHookInput,
  TimeoutErrorHookInput,
  UnexpectedErrorHookInput,
  // Model Events
  ModelSwitchHookInput,
  ModelFallbackHookInput,
  QuotaExceededHookInput,
  ModelUnavailableHookInput,
  // Memory Events
  MemorySaveHookInput,
  MemoryLoadHookInput,
  MemoryRefreshHookInput,
  ContextCompressHookInput,
  ContextExpandHookInput,
  MemoryImportHookInput,
  MemoryExportHookInput,
  // IDE Events
  IdeConnectHookInput,
  IdeDisconnectHookInput,
  FileOpenHookInput,
  FileCloseHookInput,
  CursorMoveHookInput,
  SelectionChangeHookInput,
  FileChangeHookInput,
  // MCP Events
  McpServerConnectHookInput,
  McpServerDisconnectHookInput,
  McpServerErrorHookInput,
  McpToolDiscoveredHookInput,
  McpPromptDiscoveredHookInput,
  McpOAuthStartHookInput,
  McpOAuthCompleteHookInput,
  // File Operation Events
  FileReadHookInput,
  FileWriteHookInput,
  FileEditHookInput,
  FileDeleteHookInput,
  DirectoryListHookInput,
  FileSearchHookInput,
  // Approval Events
  ApprovalRequestedHookInput,
  ApprovalGrantedHookInput,
  ApprovalDeniedHookInput,
  PermissionCheckHookInput,
  TrustDecisionHookInput,
} from './types.js';

/**
 * Helper class to trigger hooks throughout the application
 */
export class HookTrigger {
  constructor(
    private readonly hooksManager: HooksManager,
    private readonly context: HookExecutionContext,
  ) {}

  // Tool Events
  async toolValidationFailure(toolName: string, validationError: string, toolInput: Record<string, unknown>): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ToolValidationFailureHookInput>(
      HookEventName.ToolValidationFailure,
      { tool_name: toolName, validation_error: validationError, tool_input: toolInput },
      this.context
    );
  }

  async toolApproval(toolName: string, toolInput: Record<string, unknown>, approvalMode: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ToolApprovalHookInput>(
      HookEventName.ToolApproval,
      { tool_name: toolName, tool_input: toolInput, approval_mode: approvalMode },
      this.context
    );
  }

  async toolRejection(toolName: string, toolInput: Record<string, unknown>, rejectionReason?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ToolRejectionHookInput>(
      HookEventName.ToolRejection,
      { tool_name: toolName, tool_input: toolInput, rejection_reason: rejectionReason },
      this.context
    );
  }

  async toolTimeout(toolName: string, timeoutMs: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ToolTimeoutHookInput>(
      HookEventName.ToolTimeout,
      { tool_name: toolName, timeout_ms: timeoutMs },
      this.context
    );
  }

  async toolCancellation(toolName: string, cancellationReason?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ToolCancellationHookInput>(
      HookEventName.ToolCancellation,
      { tool_name: toolName, cancellation_reason: cancellationReason },
      this.context
    );
  }

  async batchToolComplete(toolsExecuted: string[], resultsCount: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<BatchToolCompleteHookInput>(
      HookEventName.BatchToolComplete,
      { tools_executed: toolsExecuted, results_count: resultsCount },
      this.context
    );
  }

  // Message/Conversation Events
  async preUserMessage(message: string, attachments?: string[]): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<PreUserMessageHookInput>(
      HookEventName.PreUserMessage,
      { message, attachments },
      this.context
    );
  }

  async postUserMessage(message: string, processed: boolean): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<PostUserMessageHookInput>(
      HookEventName.PostUserMessage,
      { message, processed },
      this.context
    );
  }

  async preModelResponse(model: string, contextLength: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<PreModelResponseHookInput>(
      HookEventName.PreModelResponse,
      { model, context_length: contextLength },
      this.context
    );
  }

  async postModelResponse(model: string, response: string, toolCalls?: string[], tokensUsed?: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<PostModelResponseHookInput>(
      HookEventName.PostModelResponse,
      { model, response, tool_calls: toolCalls, tokens_used: tokensUsed },
      this.context
    );
  }

  async conversationStart(initialMessage?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ConversationStartHookInput>(
      HookEventName.ConversationStart,
      { initial_message: initialMessage },
      this.context
    );
  }

  async conversationEnd(reason: string, finalMessage?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ConversationEndHookInput>(
      HookEventName.ConversationEnd,
      { reason, final_message: finalMessage },
      this.context
    );
  }

  async messageReceived(sender: 'user' | 'assistant' | 'system', content: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<MessageReceivedHookInput>(
      HookEventName.MessageReceived,
      { sender, content },
      this.context
    );
  }

  async messageSent(recipient: 'user' | 'model' | 'system', content: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<MessageSentHookInput>(
      HookEventName.MessageSent,
      { recipient, content },
      this.context
    );
  }

  async thoughtGenerated(thought: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ThoughtGeneratedHookInput>(
      HookEventName.ThoughtGenerated,
      { thought },
      this.context
    );
  }

  // Authentication Events
  async authenticationStart(authMethod: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<AuthenticationStartHookInput>(
      HookEventName.AuthenticationStart,
      { auth_method: authMethod },
      this.context
    );
  }

  async authenticationSuccess(authMethod: string, userId?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<AuthenticationSuccessHookInput>(
      HookEventName.AuthenticationSuccess,
      { auth_method: authMethod, user_id: userId },
      this.context
    );
  }

  async authenticationFailure(authMethod: string, error: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<AuthenticationFailureHookInput>(
      HookEventName.AuthenticationFailure,
      { auth_method: authMethod, error },
      this.context
    );
  }

  async tokenRefresh(tokenType: string, success: boolean): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<TokenRefreshHookInput>(
      HookEventName.TokenRefresh,
      { token_type: tokenType, success },
      this.context
    );
  }

  async logout(userId?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<LogoutHookInput>(
      HookEventName.Logout,
      { user_id: userId },
      this.context
    );
  }

  async unauthorizedAccess(resource: string, statusCode: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<UnauthorizedAccessHookInput>(
      HookEventName.UnauthorizedAccess,
      { resource, status_code: statusCode },
      this.context
    );
  }

  // Session Lifecycle Events
  async sessionStart(mode: string, workingDirectory: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<SessionStartHookInput>(
      HookEventName.SessionStart,
      { mode, working_directory: workingDirectory },
      this.context
    );
  }

  async sessionEnd(durationMs: number, exitCode: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<SessionEndHookInput>(
      HookEventName.SessionEnd,
      { duration_ms: durationMs, exit_code: exitCode },
      this.context
    );
  }

  async chatStart(model: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ChatStartHookInput>(
      HookEventName.ChatStart,
      { model },
      this.context
    );
  }

  async chatReset(reason: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ChatResetHookInput>(
      HookEventName.ChatReset,
      { reason },
      this.context
    );
  }

  async checkpoint(checkpointId: string, messageCount: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<CheckpointHookInput>(
      HookEventName.Checkpoint,
      { checkpoint_id: checkpointId, message_count: messageCount },
      this.context
    );
  }

  async resume(checkpointId: string, conversationId?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ResumeHookInput>(
      HookEventName.Resume,
      { checkpoint_id: checkpointId, conversation_id: conversationId },
      this.context
    );
  }

  // Error Events
  async error(errorType: string, errorMessage: string, stackTrace?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ErrorHookInput>(
      HookEventName.Error,
      { error_type: errorType, error_message: errorMessage, stack_trace: stackTrace },
      this.context
    );
  }

  async apiError(statusCode: number, errorMessage: string, endpoint?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ApiErrorHookInput>(
      HookEventName.ApiError,
      { status_code: statusCode, error_message: errorMessage, endpoint },
      this.context
    );
  }

  async networkError(errorMessage: string, url?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<NetworkErrorHookInput>(
      HookEventName.NetworkError,
      { error_message: errorMessage, url },
      this.context
    );
  }

  async validationError(errorMessage: string, field?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ValidationErrorHookInput>(
      HookEventName.ValidationError,
      { error_message: errorMessage, field },
      this.context
    );
  }

  async timeoutError(operation: string, timeoutMs: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<TimeoutErrorHookInput>(
      HookEventName.TimeoutError,
      { operation, timeout_ms: timeoutMs },
      this.context
    );
  }

  async unexpectedError(errorMessage: string, context?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<UnexpectedErrorHookInput>(
      HookEventName.UnexpectedError,
      { error_message: errorMessage, context },
      this.context
    );
  }

  // Model Events
  async modelSwitch(fromModel: string, toModel: string, reason?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ModelSwitchHookInput>(
      HookEventName.ModelSwitch,
      { from_model: fromModel, to_model: toModel, reason },
      this.context
    );
  }

  async modelFallback(primaryModel: string, fallbackModel: string, error?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ModelFallbackHookInput>(
      HookEventName.ModelFallback,
      { primary_model: primaryModel, fallback_model: fallbackModel, error },
      this.context
    );
  }

  async quotaExceeded(model: string, quotaType: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<QuotaExceededHookInput>(
      HookEventName.QuotaExceeded,
      { model, quota_type: quotaType },
      this.context
    );
  }

  async modelUnavailable(model: string, reason?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ModelUnavailableHookInput>(
      HookEventName.ModelUnavailable,
      { model, reason },
      this.context
    );
  }

  // Memory/Context Events
  async memorySave(memoryType: string, sizeBytes?: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<MemorySaveHookInput>(
      HookEventName.MemorySave,
      { memory_type: memoryType, size_bytes: sizeBytes },
      this.context
    );
  }

  async memoryLoad(memoryType: string, source: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<MemoryLoadHookInput>(
      HookEventName.MemoryLoad,
      { memory_type: memoryType, source },
      this.context
    );
  }

  async memoryRefresh(filesCount: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<MemoryRefreshHookInput>(
      HookEventName.MemoryRefresh,
      { files_count: filesCount },
      this.context
    );
  }

  async contextCompress(beforeTokens: number, afterTokens: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ContextCompressHookInput>(
      HookEventName.ContextCompress,
      { before_tokens: beforeTokens, after_tokens: afterTokens },
      this.context
    );
  }

  async contextExpand(expandedBy: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ContextExpandHookInput>(
      HookEventName.ContextExpand,
      { expanded_by: expandedBy },
      this.context
    );
  }

  async memoryImport(source: string, itemsCount: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<MemoryImportHookInput>(
      HookEventName.MemoryImport,
      { source, items_count: itemsCount },
      this.context
    );
  }

  async memoryExport(destination: string, itemsCount: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<MemoryExportHookInput>(
      HookEventName.MemoryExport,
      { destination, items_count: itemsCount },
      this.context
    );
  }

  // IDE Integration Events
  async ideConnect(ideName: string, ideVersion?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<IdeConnectHookInput>(
      HookEventName.IdeConnect,
      { ide_name: ideName, ide_version: ideVersion },
      this.context
    );
  }

  async ideDisconnect(ideName: string, reason?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<IdeDisconnectHookInput>(
      HookEventName.IdeDisconnect,
      { ide_name: ideName, reason },
      this.context
    );
  }

  async fileOpen(filePath: string, fileType?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileOpenHookInput>(
      HookEventName.FileOpen,
      { file_path: filePath, file_type: fileType },
      this.context
    );
  }

  async fileClose(filePath: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileCloseHookInput>(
      HookEventName.FileClose,
      { file_path: filePath },
      this.context
    );
  }

  async cursorMove(filePath: string, line: number, column: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<CursorMoveHookInput>(
      HookEventName.CursorMove,
      { file_path: filePath, line, column },
      this.context
    );
  }

  async selectionChange(filePath: string, selectionText?: string, selectionRange?: { start: number; end: number }): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<SelectionChangeHookInput>(
      HookEventName.SelectionChange,
      { file_path: filePath, selection_text: selectionText, selection_range: selectionRange },
      this.context
    );
  }

  async fileChange(filePath: string, changeType: 'add' | 'modify' | 'delete'): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileChangeHookInput>(
      HookEventName.FileChange,
      { file_path: filePath, change_type: changeType },
      this.context
    );
  }

  // MCP Server Events
  async mcpServerConnect(serverName: string, transportType: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<McpServerConnectHookInput>(
      HookEventName.McpServerConnect,
      { server_name: serverName, transport_type: transportType },
      this.context
    );
  }

  async mcpServerDisconnect(serverName: string, reason?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<McpServerDisconnectHookInput>(
      HookEventName.McpServerDisconnect,
      { server_name: serverName, reason },
      this.context
    );
  }

  async mcpServerError(serverName: string, errorMessage: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<McpServerErrorHookInput>(
      HookEventName.McpServerError,
      { server_name: serverName, error_message: errorMessage },
      this.context
    );
  }

  async mcpToolDiscovered(serverName: string, toolName: string, toolDescription?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<McpToolDiscoveredHookInput>(
      HookEventName.McpToolDiscovered,
      { server_name: serverName, tool_name: toolName, tool_description: toolDescription },
      this.context
    );
  }

  async mcpPromptDiscovered(serverName: string, promptName: string, promptDescription?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<McpPromptDiscoveredHookInput>(
      HookEventName.McpPromptDiscovered,
      { server_name: serverName, prompt_name: promptName, prompt_description: promptDescription },
      this.context
    );
  }

  async mcpOAuthStart(serverName: string, provider: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<McpOAuthStartHookInput>(
      HookEventName.McpOAuthStart,
      { server_name: serverName, provider },
      this.context
    );
  }

  async mcpOAuthComplete(serverName: string, success: boolean): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<McpOAuthCompleteHookInput>(
      HookEventName.McpOAuthComplete,
      { server_name: serverName, success },
      this.context
    );
  }

  // File Operation Events
  async fileRead(filePath: string, sizeBytes?: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileReadHookInput>(
      HookEventName.FileRead,
      { file_path: filePath, size_bytes: sizeBytes },
      this.context
    );
  }

  async fileWrite(filePath: string, sizeBytes?: number, overwrite: boolean = false): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileWriteHookInput>(
      HookEventName.FileWrite,
      { file_path: filePath, size_bytes: sizeBytes, overwrite },
      this.context
    );
  }

  async fileEdit(filePath: string, editsCount: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileEditHookInput>(
      HookEventName.FileEdit,
      { file_path: filePath, edits_count: editsCount },
      this.context
    );
  }

  async fileDelete(filePath: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileDeleteHookInput>(
      HookEventName.FileDelete,
      { file_path: filePath },
      this.context
    );
  }

  async directoryList(directoryPath: string, itemsCount: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<DirectoryListHookInput>(
      HookEventName.DirectoryList,
      { directory_path: directoryPath, items_count: itemsCount },
      this.context
    );
  }

  async fileSearch(searchPattern: string, searchType: 'glob' | 'grep' | 'find', resultsCount?: number): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<FileSearchHookInput>(
      HookEventName.FileSearch,
      { search_pattern: searchPattern, search_type: searchType, results_count: resultsCount },
      this.context
    );
  }

  // Approval/Permission Events
  async approvalRequested(approvalType: string, resource: string, details?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ApprovalRequestedHookInput>(
      HookEventName.ApprovalRequested,
      { approval_type: approvalType, resource, details },
      this.context
    );
  }

  async approvalGranted(approvalType: string, resource: string, grantedBy?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ApprovalGrantedHookInput>(
      HookEventName.ApprovalGranted,
      { approval_type: approvalType, resource, granted_by: grantedBy },
      this.context
    );
  }

  async approvalDenied(approvalType: string, resource: string, deniedBy?: string, reason?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<ApprovalDeniedHookInput>(
      HookEventName.ApprovalDenied,
      { approval_type: approvalType, resource, denied_by: deniedBy, reason },
      this.context
    );
  }

  async permissionCheck(permission: string, resource: string, result: boolean): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<PermissionCheckHookInput>(
      HookEventName.PermissionCheck,
      { permission, resource, result },
      this.context
    );
  }

  async trustDecision(resource: string, trusted: boolean, trustLevel?: string): Promise<HookExecutionResult[]> {
    return this.hooksManager.runHook<TrustDecisionHookInput>(
      HookEventName.TrustDecision,
      { resource, trusted, trust_level: trustLevel },
      this.context
    );
  }
}