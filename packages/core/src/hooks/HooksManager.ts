/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../config/config.js';
import { HooksConfiguration, HookMatcher, HookConfig } from './types.js';
import { HookExecutor } from './HookExecutor.js';
import {
  HookEventName,
  HookInput,
  PreToolUseHookInput,
  PostToolUseHookInput,
  HookExecutionResult,
  HookExecutionOutcome,
} from './types.js';
import { ToolCallRequestInfo, ToolCallResponseInfo } from '../index.js';
import * as path from 'path';
import * as os from 'os';

export interface HookExecutionContext {
  sessionId: string;
  transcriptPath?: string;
}

export class HooksManager {
  private readonly hookExecutor: HookExecutor;
  private readonly hooks: HooksConfiguration;

  constructor(private readonly config: Config) {
    this.hookExecutor = new HookExecutor(config.getDebugMode());
    this.hooks = config.getHooks() || {};
  }

  async runPreToolUse(
    toolRequest: ToolCallRequestInfo,
    context: HookExecutionContext,
    signal?: AbortSignal,
  ): Promise<{ shouldBlock: boolean; blockReason?: string }> {
    const hookMatchers = this.hooks.PreToolUse;
    
    if (!hookMatchers || hookMatchers.length === 0) {
      return { shouldBlock: false };
    }

    const input: PreToolUseHookInput = {
      ...this.createBaseHookInput(context),
      hook_event_name: HookEventName.PreToolUse,
      tool_name: toolRequest.name,
      tool_input: toolRequest.args,
    };

    const results = await this.executeHooksForEvent(
      hookMatchers,
      toolRequest.name,
      input,
      signal,
    );

    // Check if any hook returned a blocking error
    for (const result of results) {
      const outcome = this.hookExecutor.getOutcome(result);
      if (outcome === HookExecutionOutcome.BlockingError) {
        return {
          shouldBlock: true,
          blockReason: result.stderr || 'Hook blocked execution',
        };
      }

      // Check JSON output for continue=false
      if (result.output && result.output.continue === false) {
        return {
          shouldBlock: true,
          blockReason: result.output.stopReason || 'Hook blocked execution',
        };
      }
    }

    return { shouldBlock: false };
  }

  async runPostToolUse(
    toolRequest: ToolCallRequestInfo,
    toolResponse: ToolCallResponseInfo,
    context: HookExecutionContext,
    signal?: AbortSignal,
  ): Promise<void> {
    const hookMatchers = this.hooks.PostToolUse;
    
    if (!hookMatchers || hookMatchers.length === 0) {
      return;
    }

    const input: PostToolUseHookInput = {
      ...this.createBaseHookInput(context),
      hook_event_name: HookEventName.PostToolUse,
      tool_name: toolRequest.name,
      tool_input: toolRequest.args,
      tool_response: {
        output: typeof toolResponse.resultDisplay === 'string' ? toolResponse.resultDisplay : undefined,
        error: toolResponse.error?.message,
      },
    };

    await this.executeHooksForEvent(
      hookMatchers,
      toolRequest.name,
      input,
      signal,
    );
  }

  async runStop(
    finalMessage: string | undefined,
    context: HookExecutionContext,
    signal?: AbortSignal,
  ): Promise<void> {
    const hookMatchers = this.hooks.Stop;
    if (!hookMatchers || hookMatchers.length === 0) {
      return;
    }

    const input: HookInput = {
      ...this.createBaseHookInput(context),
      hook_event_name: HookEventName.Stop,
      final_message: finalMessage,
    };

    await this.executeHooksForEvent(hookMatchers, undefined, input, signal);
  }

  private async executeHooksForEvent(
    hookMatchers: HookMatcher[],
    toolName: string | undefined,
    input: HookInput,
    signal?: AbortSignal,
  ): Promise<HookExecutionResult[]> {
    const hooksToExecute = this.findMatchingHooks(hookMatchers, toolName);

    // Execute all hooks in parallel
    const executePromises = hooksToExecute.map((hook) =>
      this.hookExecutor.execute(hook, input, signal),
    );

    const results = await Promise.allSettled(executePromises);

    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<HookExecutionResult>).value);
  }

  private findMatchingHooks(
    hookMatchers: HookMatcher[],
    toolName: string | undefined,
  ): HookConfig[] {
    const matchingHooks: HookConfig[] = [];

    for (const matcher of hookMatchers) {
      if (!matcher.matcher || !toolName) {
        // No matcher means it applies to all tools
        matchingHooks.push(...matcher.hooks);
      } else {
        // Check if tool name matches the pattern (supports regex)
        try {
          const regex = new RegExp(matcher.matcher);
          if (regex.test(toolName)) {
            matchingHooks.push(...matcher.hooks);
          }
        } catch (e) {
          // If regex is invalid, do exact match
          if (toolName === matcher.matcher) {
            matchingHooks.push(...matcher.hooks);
          }
        }
      }
    }


    return matchingHooks;
  }

  getTranscriptPath(): string {
    // This would be implemented to return the actual transcript path
    // For now, return a placeholder
    return path.join(this.config.getProjectTempDir(), 'transcript.json');
  }

  /**
   * Generic method to run any hook event
   */
  async runHook<T extends HookInput>(
    eventName: HookEventName,
    input: any,
    context: HookExecutionContext,
    signal?: AbortSignal,
  ): Promise<HookExecutionResult[]> {
    const hookMatchers = this.hooks[eventName];
    
    if (!hookMatchers || hookMatchers.length === 0) {
      return [];
    }

    const fullInput: T = {
      ...this.createBaseHookInput(context),
      hook_event_name: eventName,
      agent_type: input.agent_type || 'gemini',
      ...input,
    } as T;

    // Determine if this event type has a tool_name for matching
    const toolName = 'tool_name' in fullInput ? (fullInput as any).tool_name : undefined;
    const matchingHooks = this.findMatchingHooks(hookMatchers, toolName);

    if (matchingHooks.length === 0) {
      return [];
    }

    // Execute all matching hooks in parallel
    const results = await Promise.allSettled(
      matchingHooks.map(hook => 
        this.hookExecutor.execute(hook, fullInput, signal)
      )
    );

    return results
      .filter((result): result is PromiseFulfilledResult<HookExecutionResult> => 
        result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }

  private createBaseHookInput(context: HookExecutionContext): Pick<import('./types.js').BaseHookInput, 'session_id' | 'transcript_path' | 'agent_type' | 'metadata'> {
    return {
      session_id: context.sessionId,
      transcript_path: context.transcriptPath,
      agent_type: 'gemini',
      metadata: {
        timestamp: Date.now(),
        user: os.userInfo().username,
        hostname: os.hostname(),
        platform: os.platform(),
        nodeVersion: process.version,
      },
    };
  }
}