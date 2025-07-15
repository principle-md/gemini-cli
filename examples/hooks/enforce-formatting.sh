#!/bin/bash
# Example hook that enforces code formatting after file edits

# Read JSON input from stdin
input=$(cat)

# Extract hook event and tool name
hook_event=$(echo "$input" | jq -r '.hook_event_name')
tool_name=$(echo "$input" | jq -r '.tool_name')

if [[ "$hook_event" == "PostToolUse" ]]; then
    if [[ "$tool_name" == "replace" ]] || [[ "$tool_name" == "write_file" ]]; then
        # Extract file path from tool input
        file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')
        
        if [[ -n "$file_path" ]]; then
            # Check file extension
            case "$file_path" in
                *.js|*.jsx|*.ts|*.tsx)
                    # Run prettier if available
                    if command -v prettier &> /dev/null; then
                        echo "Running prettier on $file_path" >&2
                        prettier --write "$file_path" 2>&1 >&2
                    fi
                    ;;
                *.py)
                    # Run black if available
                    if command -v black &> /dev/null; then
                        echo "Running black on $file_path" >&2
                        black "$file_path" 2>&1 >&2
                    fi
                    ;;
                *.go)
                    # Run gofmt if available
                    if command -v gofmt &> /dev/null; then
                        echo "Running gofmt on $file_path" >&2
                        gofmt -w "$file_path" 2>&1 >&2
                    fi
                    ;;
            esac
        fi
    fi
fi

# Always allow execution to continue
exit 0