#!/bin/bash
# Script to update remotes for organization fork

# Replace YOUR-ORG with your actual organization name
ORG_NAME="principle-md"

echo "Setting up fork for organization: $ORG_NAME"

# Rename current origin to upstream
git remote rename origin upstream

# Add your organization's fork as origin
git remote add origin "git@github.com:${ORG_NAME}/gemini-cli.git"

# Verify remotes
echo "Current remotes:"
git remote -v

# Set up tracking for main branch
git branch --set-upstream-to=origin/main main

echo "Done! Your repository now points to:"
echo "- origin: ${ORG_NAME}/gemini-cli (your fork)"
echo "- upstream: google-gemini/gemini-cli (original repo)"
echo ""
echo "To push your changes to your fork:"
echo "  git push origin main"
echo ""
echo "To sync with upstream:"
echo "  git fetch upstream"
echo "  git merge upstream/main"