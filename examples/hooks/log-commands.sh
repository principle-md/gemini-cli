#!/bin/bash
# Example hook that logs all bash commands to a file

# Read JSON input from stdin
input=$(cat)

# Extract tool name and command using jq
tool_name=$(echo "$input" | jq -r '.tool_name')
hook_event=$(echo "$input" | jq -r '.hook_event_name')

# Log file location
log_file="$HOME/.gemini/command-history.log"
mkdir -p "$(dirname "$log_file")"

# Get current timestamp
timestamp=$(date "+%Y-%m-%d %H:%M:%S")

if [[ "$hook_event" == "PreToolUse" ]] && [[ "$tool_name" == "Shell" ]]; then
    # Extract command and description from tool input
    command=$(echo "$input" | jq -r '.tool_input.command // "N/A"')
    description=$(echo "$input" | jq -r '.tool_input.description // "No description"')
    
    # Log the command
    echo "[$timestamp] PreToolUse - Shell command: $command - $description" >> "$log_file"
    
    # Check for potentially dangerous commands
    if [[ "$command" =~ rm\ -rf|sudo\ rm|format|mkfs ]]; then
        # Block dangerous commands
        echo "Dangerous command blocked: $command" >&2
        exit 2  # Exit code 2 blocks execution
    fi
elif [[ "$hook_event" == "PostToolUse" ]] && [[ "$tool_name" == "Shell" ]]; then
    # Log command completion
    command=$(echo "$input" | jq -r '.tool_input.command // "N/A"')
    error=$(echo "$input" | jq -r '.tool_response.error // null')
    
    if [[ "$error" != "null" ]]; then
        echo "[$timestamp] PostToolUse - Shell command failed: $command - Error: $error" >> "$log_file"
    else
        echo "[$timestamp] PostToolUse - Shell command succeeded: $command" >> "$log_file"
    fi
fi

# Success - allow execution to continue
exit 0