# Hooks System

The Gemini CLI hooks system allows you to customize and control the behavior of the CLI by running custom scripts at specific lifecycle events. This feature is compatible with Claude Code's hooks implementation.

## Overview

Hooks are shell commands that execute automatically when certain events occur during the CLI's operation. They can:

- Validate or block tool executions
- Log activity for auditing
- Enforce security policies
- Automatically format code after edits
- Send notifications
- Integrate with external systems

## Configuration

Hooks are configured in your settings file (`.gemini/settings.json` in your workspace or `~/.gemini/settings.json` for global settings):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Shell",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/your/hook-script.sh",
            "timeout": 5000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|WriteFile",
        "hooks": [
          {
            "type": "command",
            "command": "./format-code.sh",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

## Hook Events

### PreToolUse
Runs before a tool executes. Can block the tool execution by:
- Returning exit code 2
- Returning JSON with `{"continue": false, "stopReason": "reason"}`

### PostToolUse
Runs after a tool completes (successfully or with error). Cannot block execution but can perform cleanup or logging.

### Stop
Runs when the main agent finishes responding.

### Notification
Triggered for permission requests or when the agent is idle.

### SubagentStop
Runs when a subagent completes its task.

### PreCompact
Runs before context window compaction.

## Hook Input

Hooks receive JSON input via stdin containing:

```json
{
  "session_id": "unique-session-id",
  "transcript_path": "/path/to/transcript.json",
  "hook_event_name": "PreToolUse",
  "cwd": "/current/working/directory",
  "tool_name": "Shell",
  "tool_input": {
    "command": "ls -la",
    "description": "List files"
  },
  "metadata": {
    "timestamp": 1234567890,
    "user": "username",
    "hostname": "machine-name",
    "platform": "darwin",
    "nodeVersion": "v20.0.0"
  }
}
```

For PostToolUse events, the input also includes:

```json
{
  "tool_response": {
    "output": "command output",
    "error": "error message if failed"
  }
}
```

## Hook Output

### Exit Codes
- **0**: Success - execution continues normally
- **2**: Blocking error - tool execution is blocked, stderr is fed to the model
- **Other**: Non-blocking error - logged but execution continues

### JSON Output (Optional)
Hooks can output JSON to stdout for more control:

```json
{
  "continue": false,
  "stopReason": "Security policy violation",
  "suppressOutput": true
}
```

## Tool Name Matching

The `matcher` field supports:
- Exact tool names: `"run_shell_command"`, `"replace"`, `"write_file"`, `"read_file"`
- Regex patterns: `"replace|write_file"`, `".*"` (matches all tools)
- Case-sensitive matching

Complete list of built-in tool names:
- `run_shell_command` - Execute shell commands
- `read_file` - Read file contents
- `write_file` - Write new files
- `replace` - Edit/replace text in files (EditTool)
- `read_many_files` - Read multiple files at once
- `list_directory` - List directory contents (LSTool)
- `search_file_content` - Search file contents (GrepTool)
- `glob` - Find files by pattern
- `web_fetch` - Fetch web content
- `google_web_search` - Search Google
- `save_memory` - Save information to memory

## Examples

### 1. Command Logger

Log all shell commands to a file:

```bash
#!/bin/bash
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')
command=$(echo "$input" | jq -r '.tool_input.command // ""')

if [[ "$tool_name" == "Shell" ]]; then
    echo "[$(date)] $command" >> ~/.gemini/command-history.log
fi
exit 0
```

### 2. Security Guard

Block dangerous commands:

```bash
#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

if [[ "$command" =~ rm.*-rf|sudo|format ]]; then
    echo "Dangerous command blocked" >&2
    exit 2
fi
exit 0
```

### 3. Auto-formatter

Format code after edits:

```bash
#!/bin/bash
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

case "$file_path" in
    *.js|*.ts) prettier --write "$file_path" ;;
    *.py) black "$file_path" ;;
    *.go) gofmt -w "$file_path" ;;
esac
exit 0
```

### 4. Slack Notifier

Send notifications to Slack:

```bash
#!/bin/bash
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')
webhook_url="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

message="Gemini CLI executed tool: $tool_name"
curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$message\"}" \
    "$webhook_url" 2>/dev/null
exit 0
```

## Best Practices

1. **Keep hooks fast**: Use appropriate timeouts (default: 60 seconds)
2. **Handle errors gracefully**: Always exit with appropriate codes
3. **Use absolute paths**: Avoid relative paths in hook commands
4. **Validate input**: Check for required fields before processing
5. **Log appropriately**: Use stderr for debug messages
6. **Test thoroughly**: Test hooks in isolation before deploying

## Security Considerations

- Hooks run with the same permissions as the Gemini CLI
- Validate all input to prevent injection attacks
- Be cautious with hooks that modify files or execute commands
- Consider using read-only hooks for sensitive environments

## Debugging

To debug hooks:

1. Run Gemini CLI in debug mode: `gemini --debug`
2. Check hook stderr output in the console
3. Add logging to your hook scripts
4. Test hooks standalone with sample JSON input

## Limitations

- Hooks must complete within the configured timeout
- Large outputs may be truncated
- Hooks cannot modify tool input parameters
- Network operations should be async or very fast

## Migration from Other Tools

If migrating from Claude Code, your existing hooks should work with minimal changes. The hook input/output format and exit code behavior are compatible.