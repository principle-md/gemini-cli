/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Central registry of all built-in tool names.
 * This helps with type safety and provides a single source of truth
 * for tool names used in hooks and other integrations.
 */
export const TOOL_NAMES = {
  // File operations
  READ_FILE: 'read_file',
  WRITE_FILE: 'write_file',
  REPLACE: 'replace', // Edit tool
  READ_MANY_FILES: 'read_many_files',
  
  // File system operations
  LIST_DIRECTORY: 'list_directory',
  SEARCH_FILE_CONTENT: 'search_file_content', // Grep tool
  GLOB: 'glob',
  
  // Shell operations
  RUN_SHELL_COMMAND: 'run_shell_command',
  
  // Web operations
  WEB_FETCH: 'web_fetch',
  GOOGLE_WEB_SEARCH: 'google_web_search',
  
  // Memory operations
  SAVE_MEMORY: 'save_memory',
} as const;

export type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];

// For backward compatibility, export individual names
export const {
  READ_FILE,
  WRITE_FILE,
  REPLACE,
  READ_MANY_FILES,
  LIST_DIRECTORY,
  SEARCH_FILE_CONTENT,
  GLOB,
  RUN_SHELL_COMMAND,
  WEB_FETCH,
  GOOGLE_WEB_SEARCH,
  SAVE_MEMORY,
} = TOOL_NAMES;