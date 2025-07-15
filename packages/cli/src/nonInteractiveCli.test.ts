/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runNonInteractive } from './nonInteractiveCli.js';
import { Config, GeminiClient, ToolRegistry } from '@google/gemini-cli-core';
import { GenerateContentResponse, Part, FunctionCall } from '@google/genai';

// Mock dependencies
vi.mock('@google/gemini-cli-core', async () => {
  const actualCore = await vi.importActual<
    typeof import('@google/gemini-cli-core')
  >('@google/gemini-cli-core');
  return {
    ...actualCore,
    GeminiClient: vi.fn(),
    ToolRegistry: vi.fn(),
    executeToolCall: vi.fn(),
    HooksManager: vi.fn(() => ({
      runStop: vi.fn().mockResolvedValue(undefined),
      runPreToolUse: vi.fn().mockResolvedValue({ shouldBlock: false }),
      runPostToolUse: vi.fn().mockResolvedValue(undefined),
      getTranscriptPath: vi.fn().mockReturnValue('/tmp/transcript.json'),
    })),
  };
});

describe('runNonInteractive', () => {
  let mockConfig: Config;
  let mockGeminiClient: GeminiClient;
  let mockToolRegistry: ToolRegistry;
  let mockHooksManager: any;
  let mockChat: {
    sendMessageStream: ReturnType<typeof vi.fn>;
  };
  let mockProcessStdoutWrite: ReturnType<typeof vi.fn>;
  let mockProcessExit: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockChat = {
      sendMessageStream: vi.fn(),
    };
    mockGeminiClient = {
      getChat: vi.fn().mockResolvedValue(mockChat),
    } as unknown as GeminiClient;
    mockToolRegistry = {
      getFunctionDeclarations: vi.fn().mockReturnValue([]),
      getTool: vi.fn(),
    } as unknown as ToolRegistry;
    
    mockHooksManager = {
      runStop: vi.fn().mockResolvedValue(undefined),
      runPreToolUse: vi.fn().mockResolvedValue({ shouldBlock: false }),
      runPostToolUse: vi.fn().mockResolvedValue(undefined),
      getTranscriptPath: vi.fn().mockReturnValue('/tmp/transcript.json'),
    };

    vi.mocked(GeminiClient).mockImplementation(() => mockGeminiClient);
    vi.mocked(ToolRegistry).mockImplementation(() => mockToolRegistry);
    const { HooksManager } = vi.mocked(await import('@google/gemini-cli-core'));
    vi.mocked(HooksManager).mockImplementation(() => mockHooksManager);

    mockConfig = {
      getToolRegistry: vi.fn().mockReturnValue(mockToolRegistry),
      getGeminiClient: vi.fn().mockReturnValue(mockGeminiClient),
      getContentGeneratorConfig: vi.fn().mockReturnValue({}),
      getMaxSessionTurns: vi.fn().mockReturnValue(10),
      getSessionId: vi.fn().mockReturnValue('test-session-id'),
      initialize: vi.fn(),
    } as unknown as Config;

    mockProcessStdoutWrite = vi.fn().mockImplementation(() => true);
    process.stdout.write = mockProcessStdoutWrite as any; // Use any to bypass strict signature matching for mock
    mockProcessExit = vi
      .fn()
      .mockImplementation((_code?: number) => undefined as never);
    process.exit = mockProcessExit as any; // Use any for process.exit mock
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original process methods if they were globally patched
    // This might require storing the original methods before patching them in beforeEach
  });

  it('should process input and write text output', async () => {
    const inputStream = (async function* () {
      yield {
        candidates: [{ content: { parts: [{ text: 'Hello' }] } }],
      } as GenerateContentResponse;
      yield {
        candidates: [{ content: { parts: [{ text: ' World' }] } }],
      } as GenerateContentResponse;
    })();
    mockChat.sendMessageStream.mockResolvedValue(inputStream);

    await runNonInteractive(mockConfig, 'Test input', 'prompt-id-1');

    expect(mockChat.sendMessageStream).toHaveBeenCalledWith(
      {
        message: [{ text: 'Test input' }],
        config: {
          abortSignal: expect.any(AbortSignal),
          tools: [{ functionDeclarations: [] }],
        },
      },
      expect.any(String),
    );
    expect(mockProcessStdoutWrite).toHaveBeenCalledWith('Hello');
    expect(mockProcessStdoutWrite).toHaveBeenCalledWith(' World');
    expect(mockProcessStdoutWrite).toHaveBeenCalledWith('\n');
  });

  it('should handle a single tool call and respond', async () => {
    const functionCall: FunctionCall = {
      id: 'fc1',
      name: 'testTool',
      args: { p: 'v' },
    };
    const toolResponsePart: Part = {
      functionResponse: {
        name: 'testTool',
        id: 'fc1',
        response: { result: 'tool success' },
      },
    };

    const { executeToolCall: mockCoreExecuteToolCall } = await import(
      '@google/gemini-cli-core'
    );
    vi.mocked(mockCoreExecuteToolCall).mockResolvedValue({
      callId: 'fc1',
      responseParts: [toolResponsePart],
      resultDisplay: 'Tool success display',
      error: undefined,
    });

    const stream1 = (async function* () {
      yield { functionCalls: [functionCall] } as GenerateContentResponse;
    })();
    const stream2 = (async function* () {
      yield {
        candidates: [{ content: { parts: [{ text: 'Final answer' }] } }],
      } as GenerateContentResponse;
    })();
    mockChat.sendMessageStream
      .mockResolvedValueOnce(stream1)
      .mockResolvedValueOnce(stream2);

    await runNonInteractive(mockConfig, 'Use a tool', 'prompt-id-2');

    expect(mockChat.sendMessageStream).toHaveBeenCalledTimes(2);
    expect(mockCoreExecuteToolCall).toHaveBeenCalledWith(
      mockConfig,
      expect.objectContaining({ callId: 'fc1', name: 'testTool' }),
      mockToolRegistry,
      expect.any(AbortSignal),
    );
    expect(mockChat.sendMessageStream).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: [toolResponsePart],
      }),
      expect.any(String),
    );
    expect(mockProcessStdoutWrite).toHaveBeenCalledWith('Final answer');
  });

  it('should handle error during tool execution', async () => {
    const functionCall: FunctionCall = {
      id: 'fcError',
      name: 'errorTool',
      args: {},
    };
    const errorResponsePart: Part = {
      functionResponse: {
        name: 'errorTool',
        id: 'fcError',
        response: { error: 'Tool failed' },
      },
    };

    const { executeToolCall: mockCoreExecuteToolCall } = await import(
      '@google/gemini-cli-core'
    );
    vi.mocked(mockCoreExecuteToolCall).mockResolvedValue({
      callId: 'fcError',
      responseParts: [errorResponsePart],
      resultDisplay: 'Tool execution failed badly',
      error: new Error('Tool failed'),
    });

    const stream1 = (async function* () {
      yield { functionCalls: [functionCall] } as GenerateContentResponse;
    })();

    const stream2 = (async function* () {
      yield {
        candidates: [
          { content: { parts: [{ text: 'Could not complete request.' }] } },
        ],
      } as GenerateContentResponse;
    })();
    mockChat.sendMessageStream
      .mockResolvedValueOnce(stream1)
      .mockResolvedValueOnce(stream2);
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await runNonInteractive(mockConfig, 'Trigger tool error', 'prompt-id-3');

    expect(mockCoreExecuteToolCall).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error executing tool errorTool: Tool execution failed badly',
    );
    expect(mockChat.sendMessageStream).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: [errorResponsePart],
      }),
      expect.any(String),
    );
    expect(mockProcessStdoutWrite).toHaveBeenCalledWith(
      'Could not complete request.',
    );
  });

  it('should exit with error if sendMessageStream throws initially', async () => {
    const apiError = new Error('API connection failed');
    mockChat.sendMessageStream.mockRejectedValue(apiError);
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await runNonInteractive(mockConfig, 'Initial fail', 'prompt-id-4');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[API Error: API connection failed]',
    );
  });

  it('should not exit if a tool is not found, and should send error back to model', async () => {
    const functionCall: FunctionCall = {
      id: 'fcNotFound',
      name: 'nonExistentTool',
      args: {},
    };
    const errorResponsePart: Part = {
      functionResponse: {
        name: 'nonExistentTool',
        id: 'fcNotFound',
        response: { error: 'Tool "nonExistentTool" not found in registry.' },
      },
    };

    const { executeToolCall: mockCoreExecuteToolCall } = await import(
      '@google/gemini-cli-core'
    );
    vi.mocked(mockCoreExecuteToolCall).mockResolvedValue({
      callId: 'fcNotFound',
      responseParts: [errorResponsePart],
      resultDisplay: 'Tool "nonExistentTool" not found in registry.',
      error: new Error('Tool "nonExistentTool" not found in registry.'),
    });

    const stream1 = (async function* () {
      yield { functionCalls: [functionCall] } as GenerateContentResponse;
    })();
    const stream2 = (async function* () {
      yield {
        candidates: [
          {
            content: {
              parts: [{ text: 'Unfortunately the tool does not exist.' }],
            },
          },
        ],
      } as GenerateContentResponse;
    })();
    mockChat.sendMessageStream
      .mockResolvedValueOnce(stream1)
      .mockResolvedValueOnce(stream2);
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await runNonInteractive(
      mockConfig,
      'Trigger tool not found',
      'prompt-id-5',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error executing tool nonExistentTool: Tool "nonExistentTool" not found in registry.',
    );

    expect(mockProcessExit).not.toHaveBeenCalled();

    expect(mockChat.sendMessageStream).toHaveBeenCalledTimes(2);
    expect(mockChat.sendMessageStream).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: [errorResponsePart],
      }),
      expect.any(String),
    );

    expect(mockProcessStdoutWrite).toHaveBeenCalledWith(
      'Unfortunately the tool does not exist.',
    );
  });

  it('should exit when max session turns are exceeded', async () => {
    const functionCall: FunctionCall = {
      id: 'fcLoop',
      name: 'loopTool',
      args: {},
    };
    const toolResponsePart: Part = {
      functionResponse: {
        name: 'loopTool',
        id: 'fcLoop',
        response: { result: 'still looping' },
      },
    };

    // Config with a max turn of 1
    vi.mocked(mockConfig.getMaxSessionTurns).mockReturnValue(1);

    const { executeToolCall: mockCoreExecuteToolCall } = await import(
      '@google/gemini-cli-core'
    );
    vi.mocked(mockCoreExecuteToolCall).mockResolvedValue({
      callId: 'fcLoop',
      responseParts: [toolResponsePart],
      resultDisplay: 'Still looping',
      error: undefined,
    });

    const stream = (async function* () {
      yield { functionCalls: [functionCall] } as GenerateContentResponse;
    })();

    mockChat.sendMessageStream.mockResolvedValue(stream);
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await runNonInteractive(mockConfig, 'Trigger loop');

    expect(mockChat.sendMessageStream).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `
 Reached max session turns for this session. Increase the number of turns by specifying maxSessionTurns in settings.json.`,
    );
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it('should call runStop when session completes successfully', async () => {
    const inputStream = (async function* () {
      yield {
        candidates: [{ content: { parts: [{ text: 'Goodbye!' }] } }],
      } as GenerateContentResponse;
    })();
    mockChat.sendMessageStream.mockResolvedValue(inputStream);

    await runNonInteractive(mockConfig, 'Say goodbye', 'prompt-id-stop-1');

    expect(mockHooksManager.runStop).toHaveBeenCalledTimes(1);
    expect(mockHooksManager.runStop).toHaveBeenCalledWith(
      'Non-interactive session completed',
      {
        sessionId: 'test-session-id',
        transcriptPath: '/tmp/transcript.json',
      },
    );
  });

  it('should call runStop when session encounters an error', async () => {
    const errorMessage = 'Test error occurred';
    const errorStream = (async function* () {
      throw new Error(errorMessage);
    })();
    mockChat.sendMessageStream.mockResolvedValue(errorStream);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await runNonInteractive(mockConfig, 'Trigger error', 'prompt-id-stop-2');

    expect(mockHooksManager.runStop).toHaveBeenCalledTimes(1);
    expect(mockHooksManager.runStop).toHaveBeenCalledWith(
      'Non-interactive session ended with error',
      {
        sessionId: 'test-session-id',
        transcriptPath: '/tmp/transcript.json',
      },
    );
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(errorMessage),
    );
  });

  it('should not block execution if runStop fails', async () => {
    const inputStream = (async function* () {
      yield {
        candidates: [{ content: { parts: [{ text: 'Hello' }] } }],
      } as GenerateContentResponse;
    })();
    mockChat.sendMessageStream.mockResolvedValue(inputStream);
    
    // Make runStop reject
    mockHooksManager.runStop.mockRejectedValueOnce(new Error('Hook failed'));
    
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await runNonInteractive(mockConfig, 'Test input', 'prompt-id-stop-3');

    expect(mockHooksManager.runStop).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error running Stop hooks:',
      expect.any(Error),
    );
    // Process should continue normally despite hook failure
    expect(mockProcessStdoutWrite).toHaveBeenCalledWith('Hello');
    expect(mockProcessStdoutWrite).toHaveBeenCalledWith('\n');
  });
});
