/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn } from 'child_process';
import { HookConfig } from './types.js';
import {
  HookInput,
  HookOutput,
  HookExecutionResult,
  HookExecutionOutcome,
} from './types.js';

const DEFAULT_HOOK_TIMEOUT = 60000; // 60 seconds

export class HookExecutor {
  constructor(private readonly debugMode: boolean = false) {}

  async execute(
    hook: HookConfig,
    input: HookInput,
    signal?: AbortSignal,
  ): Promise<HookExecutionResult> {
    const timeout = hook.timeout ?? DEFAULT_HOOK_TIMEOUT;
    const inputJson = JSON.stringify(input);
    

    return new Promise<HookExecutionResult>((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let processExited = false;

      const child = spawn(hook.command, [], {
        shell: true,
        env: { ...process.env },
      });

      const timeoutId = setTimeout(() => {
        if (!processExited) {
          timedOut = true;
          child.kill('SIGTERM');
          setTimeout(() => {
            if (!processExited) {
              child.kill('SIGKILL');
            }
          }, 5000);
        }
      }, timeout);

      // Handle abort signal
      const abortHandler = () => {
        if (!processExited) {
          child.kill('SIGTERM');
        }
      };

      if (signal) {
        signal.addEventListener('abort', abortHandler);
      }

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        processExited = true;
        if (signal) {
          signal.removeEventListener('abort', abortHandler);
        }
        resolve({
          exitCode: -1,
          stdout,
          stderr: stderr + '\n' + error.message,
          timedOut: false,
        });
      });

      child.on('exit', (code, signalName) => {
        clearTimeout(timeoutId);
        processExited = true;
        if (signal) {
          signal.removeEventListener('abort', abortHandler);
        }

        const exitCode = code ?? -1;
        let output: HookOutput | undefined;

        // Try to parse JSON output from stdout
        if (stdout.trim()) {
          try {
            output = JSON.parse(stdout.trim());
          } catch {
            // Not JSON, that's ok
          }
        }

        if (this.debugMode) {
          console.error(`[Hook Debug] Command: ${hook.command}`);
          console.error(`[Hook Debug] Exit code: ${exitCode}`);
          console.error(`[Hook Debug] Stdout: ${stdout}`);
          console.error(`[Hook Debug] Stderr: ${stderr}`);
          if (timedOut) {
            console.error(`[Hook Debug] Timed out after ${timeout}ms`);
          }
        }

        resolve({
          exitCode,
          stdout,
          stderr,
          timedOut,
          output,
        });
      });

      // Send input to stdin
      child.stdin.write(inputJson);
      child.stdin.end();
    });
  }

  getOutcome(result: HookExecutionResult): HookExecutionOutcome {
    if (result.timedOut) {
      return HookExecutionOutcome.Timeout;
    }

    switch (result.exitCode) {
      case 0:
        return HookExecutionOutcome.Success;
      case 2:
        return HookExecutionOutcome.BlockingError;
      default:
        return HookExecutionOutcome.NonBlockingError;
    }
  }
}