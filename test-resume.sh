#!/bin/bash

# Test script for resume functionality

echo "Testing gemini CLI resume functionality..."

# Show help to verify --resume option exists
echo "1. Checking if --resume option exists in help:"
npm run cli -- --help | grep -A1 resume

echo -e "\n2. Testing resume with numeric ID:"
echo "   gemini --resume 1"

echo -e "\n3. Testing resume with tag name:"
echo "   gemini --resume my-project"

echo -e "\nNote: To fully test, you need to:"
echo "  1. Save a conversation: /chat save test-session"
echo "  2. List conversations: /chat list"
echo "  3. Resume by ID: gemini --resume 1"
echo "  4. Resume by tag: gemini --resume test-session"