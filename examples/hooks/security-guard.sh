#!/bin/bash
# Example hook that enforces security policies

# Read JSON input from stdin
input=$(cat)

# Extract relevant fields
tool_name=$(echo "$input" | jq -r '.tool_name')
hook_event=$(echo "$input" | jq -r '.hook_event_name')

if [[ "$hook_event" == "PreToolUse" ]]; then
    case "$tool_name" in
        "Shell")
            command=$(echo "$input" | jq -r '.tool_input.command // ""')
            
            # Block dangerous commands
            if [[ "$command" =~ (rm|delete|format|mkfs|dd|shred).*(/|\\*) ]]; then
                echo "Security Policy: Potentially destructive command blocked" >&2
                echo '{"continue": false, "stopReason": "This command appears to be destructive and is blocked by security policy"}' | jq .
                exit 0
            fi
            
            # Block sudo commands
            if [[ "$command" =~ ^sudo\  ]]; then
                echo "Security Policy: Sudo commands are not allowed" >&2
                exit 2  # Block with error
            fi
            ;;
            
        "WriteFile"|"Edit")
            file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')
            
            # Block writes to sensitive files
            if [[ "$file_path" =~ (\.env|\.git/|node_modules/|/etc/|~/.ssh/) ]]; then
                echo "Security Policy: Cannot modify sensitive file: $file_path" >&2
                exit 2
            fi
            ;;
    esac
fi

# Allow by default
exit 0