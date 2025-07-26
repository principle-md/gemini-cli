/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fsPromises from 'fs/promises';
import React from 'react';
import { Text } from 'ink';
import { Colors } from '../colors.js';
import {
  CommandContext,
  SlashCommand,
  MessageActionReturn,
  CommandKind,
  SlashCommandActionReturn,
} from './types.js';
import { decodeTagName } from '@google/gemini-cli-core';
import path from 'path';
import { HistoryItemWithoutId, MessageType } from '../types.js';

interface ChatDetail {
  id: number;
  name: string;
  mtime: Date;
}

const getSavedChatTags = async (
  context: CommandContext,
  mtSortDesc: boolean,
): Promise<ChatDetail[]> => {
  const geminiDir = context.services.config?.getProjectTempDir();
  if (!geminiDir) {
    return [];
  }
  try {
    const file_head = 'checkpoint-';
    const file_tail = '.json';
    const files = await fsPromises.readdir(geminiDir);
    const chatDetails: ChatDetail[] = [];

    for (const file of files) {
      if (file.startsWith(file_head) && file.endsWith(file_tail)) {
        const filePath = path.join(geminiDir, file);
        const stats = await fsPromises.stat(filePath);
        const tagName = file.slice(file_head.length, -file_tail.length);
        chatDetails.push({
          id: 0, // Will be assigned after sorting
          name: decodeTagName(tagName),
          mtime: stats.mtime,
        });
      }
    }

    chatDetails.sort((a, b) =>
      mtSortDesc
        ? b.mtime.getTime() - a.mtime.getTime()
        : a.mtime.getTime() - b.mtime.getTime(),
    );

    // Assign IDs after sorting (1-based indexing for user-friendliness)
    chatDetails.forEach((chat, index) => {
      chat.id = index + 1;
    });

    return chatDetails;
  } catch (_err) {
    return [];
  }
};

const listCommand: SlashCommand = {
  name: 'list',
  description: 'List saved conversation checkpoints',
  kind: CommandKind.BUILT_IN,
  action: async (context): Promise<MessageActionReturn> => {
    const chatDetails = await getSavedChatTags(context, false);
    if (chatDetails.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: 'No saved conversation checkpoints found.',
      };
    }

    const maxNameLength = Math.max(
      ...chatDetails.map((chat) => chat.name.length),
    );
    const maxIdLength = chatDetails.length.toString().length;

    let message = 'List of saved conversations:\n\n';
    for (const chat of chatDetails) {
      const paddedId = chat.id.toString().padStart(maxIdLength, ' ');
      const paddedName = chat.name.padEnd(maxNameLength, ' ');
      const isoString = chat.mtime.toISOString();
      const match = isoString.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
      const formattedDate = match ? `${match[1]} ${match[2]}` : 'Invalid Date';
      message += `  ${paddedId}. \u001b[36m${paddedName}\u001b[0m  \u001b[90m(saved on ${formattedDate})\u001b[0m\n`;
    }
    message += `\n\u001b[90mNote: Newest last, oldest first. Use /chat resume <id> or /chat resume <tag>\u001b[0m`;
    return {
      type: 'message',
      messageType: 'info',
      content: message,
    };
  },
};

const saveCommand: SlashCommand = {
  name: 'save',
  description:
    'Save the current conversation as a checkpoint. Usage: /chat save <tag>',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<SlashCommandActionReturn | void> => {
    const tag = args.trim();
    if (!tag) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Missing tag. Usage: /chat save <tag>',
      };
    }

    const { logger, config } = context.services;
    await logger.initialize();

    if (!context.overwriteConfirmed) {
      const exists = await logger.checkpointExists(tag);
      if (exists) {
        return {
          type: 'confirm_action',
          prompt: React.createElement(
            Text,
            null,
            'A checkpoint with the tag ',
            React.createElement(Text, { color: Colors.AccentPurple }, tag),
            ' already exists. Do you want to overwrite it?',
          ),
          originalInvocation: {
            raw: context.invocation?.raw || `/chat save ${tag}`,
          },
        };
      }
    }

    const chat = await config?.getGeminiClient()?.getChat();
    if (!chat) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'No chat client available to save conversation.',
      };
    }

    const history = chat.getHistory();
    if (history.length > 2) {
      await logger.saveCheckpoint(history, tag);
      return {
        type: 'message',
        messageType: 'info',
        content: `Conversation checkpoint saved with tag: ${decodeTagName(tag)}.`,
      };
    } else {
      return {
        type: 'message',
        messageType: 'info',
        content: 'No conversation found to save.',
      };
    }
  },
};

const resumeCommand: SlashCommand = {
  name: 'resume',
  altNames: ['load'],
  description:
    'Resume a conversation from a checkpoint. Usage: /chat resume <id|tag>',
  kind: CommandKind.BUILT_IN,
  action: async (context, args) => {
    const input = args.trim();
    if (!input) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Missing ID or tag. Usage: /chat resume <id|tag>',
      };
    }

    const { logger } = context.services;
    await logger.initialize();
    
    let tag = input;
    
    // Check if input is a numeric ID
    const numericId = parseInt(input, 10);
    if (!isNaN(numericId) && numericId > 0) {
      // Get list of chats sorted by date (oldest first)
      const chatDetails = await getSavedChatTags(context, false);
      const chat = chatDetails.find(c => c.id === numericId);
      
      if (!chat) {
        return {
          type: 'message',
          messageType: 'error',
          content: `No saved checkpoint found with ID: ${numericId}. Use /chat list to see available checkpoints.`,
        };
      }
      
      tag = chat.name;
    }
    
    const conversation = await logger.loadCheckpoint(tag);

    if (conversation.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: `No saved checkpoint found with tag: ${decodeTagName(tag)}.`,
      };
    }

    const rolemap: { [key: string]: MessageType } = {
      user: MessageType.USER,
      model: MessageType.GEMINI,
    };

    const uiHistory: HistoryItemWithoutId[] = [];
    let hasSystemPrompt = false;
    let i = 0;

    for (const item of conversation) {
      i += 1;
      const text =
        item.parts
          ?.filter((m) => !!m.text)
          .map((m) => m.text)
          .join('') || '';
      if (!text) {
        continue;
      }
      if (i === 1 && text.match(/context for our chat/)) {
        hasSystemPrompt = true;
      }
      if (i > 2 || !hasSystemPrompt) {
        uiHistory.push({
          type: (item.role && rolemap[item.role]) || MessageType.GEMINI,
          text,
        } as HistoryItemWithoutId);
      }
    }
    return {
      type: 'load_history',
      history: uiHistory,
      clientHistory: conversation,
    };
  },
  completion: async (context, partialArg) => {
    const chatDetails = await getSavedChatTags(context, true);
    const completions: string[] = [];
    
    // Add tag completions
    completions.push(
      ...chatDetails
        .map((chat) => chat.name)
        .filter((name) => name.startsWith(partialArg))
    );
    
    // Add ID completions
    completions.push(
      ...chatDetails
        .map((chat) => chat.id.toString())
        .filter((id) => id.startsWith(partialArg))
    );
    
    return completions;
  },
};

const deleteCommand: SlashCommand = {
  name: 'delete',
  description: 'Delete a conversation checkpoint. Usage: /chat delete <tag>',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<MessageActionReturn> => {
    const tag = args.trim();
    if (!tag) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Missing tag. Usage: /chat delete <tag>',
      };
    }

    const { logger } = context.services;
    await logger.initialize();
    const deleted = await logger.deleteCheckpoint(tag);

    if (deleted) {
      return {
        type: 'message',
        messageType: 'info',
        content: `Conversation checkpoint '${decodeTagName(tag)}' has been deleted.`,
      };
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: `Error: No checkpoint found with tag '${decodeTagName(tag)}'.`,
      };
    }
  },
  completion: async (context, partialArg) => {
    const chatDetails = await getSavedChatTags(context, true);
    return chatDetails
      .map((chat) => chat.name)
      .filter((name) => name.startsWith(partialArg));
  },
};

export const chatCommand: SlashCommand = {
  name: 'chat',
  description: 'Manage conversation history.',
  kind: CommandKind.BUILT_IN,
  subCommands: [listCommand, saveCommand, resumeCommand, deleteCommand],
};
