/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolCallRequestInfo, ToolCallResponseInfo } from '../index.js';

export enum HookEventName {
  PreToolUse = 'PreToolUse',
  PostToolUse = 'PostToolUse',
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

export type HookInput =
  | PreToolUseHookInput
  | PostToolUseHookInput
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
  PreToolUse?: HookMatcher[];
  PostToolUse?: HookMatcher[];
  Notification?: HookMatcher[];
  Stop?: HookMatcher[];
  SubagentStop?: HookMatcher[];
  PreCompact?: HookMatcher[];
}