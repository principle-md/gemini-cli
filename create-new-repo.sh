#!/bin/bash
# Script to create a new repository from this code

# Replace with your organization and repo name
ORG_NAME="principle-md"
REPO_NAME="gemini-cli-enhanced"

echo "Creating new repository: ${ORG_NAME}/${REPO_NAME}"

# Remove existing git history
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "Initial commit: Gemini CLI with hooks system"

# Add your organization's repository as origin
git remote add origin "git@github.com:${ORG_NAME}/${REPO_NAME}.git"

echo "Done! Now:"
echo "1. Create a new repository on GitHub: ${ORG_NAME}/${REPO_NAME}"
echo "2. Run: git push -u origin main"