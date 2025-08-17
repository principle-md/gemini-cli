#!/bin/bash
# Test the stop hook with sample input

echo '{
  "session_id": "test-session-123",
  "hook_event_name": "Stop",
  "final_message": "Session completed successfully"
}' | node /Users/griever/Developer/PrincipleMD/stop-hook-fixed.js

echo "Exit code: $?"