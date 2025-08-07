# Gemini CLI

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

This repository contains the Gemini CLI, a command-line AI workflow tool that connects to your
tools, understands your code and accelerates your workflows.

With the Gemini CLI you can:

- Query and edit large codebases in and beyond Gemini's 1M token context window.
- Generate new apps from PDFs or sketches, using Gemini's multimodal capabilities.
- Automate operational tasks, like querying pull requests or handling complex rebases.
- Integrate with GitHub: Use the [Gemini CLI GitHub Action](https://github.com/google-github-actions/run-gemini-cli) for automated PR reviews, issue triage, and on-demand AI assistance directly in your repositories.
- Use tools and MCP servers to connect new capabilities, including [media generation with Imagen,
  Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Ground your queries with the [Google Search](https://ai.google.dev/gemini-api/docs/grounding)
  tool, built into Gemini.

## Quickstart

You have two options to install Gemini CLI.

### With Node

1. **Prerequisites:** Ensure you have [Node.js version 20](https://nodejs.org/en/download) or higher installed.
2. **Run the CLI:** Execute the following command in your terminal:

   ```bash
   npx https://github.com/google-gemini/gemini-cli
   ```

   Or install it with:

   ```bash
   npm install -g @google/gemini-cli
   ```

   Then, run the CLI from anywhere:

   ```bash
   gemini
   ```

### With Homebrew

1. **Prerequisites:** Ensure you have [Homebrew](https://brew.sh/) installed.
2. **Install the CLI:** Execute the following command in your terminal:

   ```bash
   brew install gemini-cli
   ```

   Then, run the CLI from anywhere:

   ```bash
   gemini
   ```

### Common Configuration steps

3. **Pick a color theme**
4. **Authenticate:** When prompted, sign in with your personal Google account. This will grant you up to 60 model requests per minute and 1,000 model requests per day using Gemini.

You are now ready to use the Gemini CLI!

## Running from Local Development

If you've cloned this repository and want to run your local version (e.g., to test modifications or add features like hooks):

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run the CLI locally:**
   ```bash
   npm start
   ```

4. **Make it globally available** (optional):
   
   Using npm link:
   ```bash
   npm link
   ```
   
   Or create an alias in your shell config:
   ```bash
   alias gemini="node /path/to/gemini-cli/bundle/gemini.js"
   ```

### Use a Gemini API key:

The Gemini API provides a free tier with [100 requests per day](https://ai.google.dev/gemini-api/docs/rate-limits#free-tier) using Gemini 2.5 Pro, control over which model you use, and access to higher rate limits (with a paid plan):

1. Generate a key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Set it as an environment variable in your terminal. Replace `YOUR_API_KEY` with your generated key.

   ```bash
   export GEMINI_API_KEY="YOUR_API_KEY"
   ```

3. (Optionally) Upgrade your Gemini API project to a paid plan on the API key page (will automatically unlock [Tier 1 rate limits](https://ai.google.dev/gemini-api/docs/rate-limits#tier-1))

### Use a Vertex AI API key:

The Vertex AI API provides a [free tier](https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview) using express mode for Gemini 2.5 Pro, control over which model you use, and access to higher rate limits with a billing account:

1. Generate a key from [Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys).
2. Set it as an environment variable in your terminal. Replace `YOUR_API_KEY` with your generated key and set GOOGLE_GENAI_USE_VERTEXAI to true

   ```bash
   export GOOGLE_API_KEY="YOUR_API_KEY"
   export GOOGLE_GENAI_USE_VERTEXAI=true
   ```

3. (Optionally) Add a billing account on your project to get access to [higher usage limits](https://cloud.google.com/vertex-ai/generative-ai/docs/quotas)

For other authentication methods, including Google Workspace accounts, see the [authentication](./docs/cli/authentication.md) guide.

## Hooks System

Gemini CLI includes a hooks system that allows you to run custom scripts in response to various events during CLI operation. This enables workflow automation, logging, monitoring, and integration with external tools.

### Configuration

Hooks are configured in your settings file (`~/.gemini/settings.json`):

```json
{
  "hooks": [
    {
      "name": "file-tracker",
      "command": "/path/to/your/hook-script.js",
      "events": ["PreToolUse", "PostToolUse"],
      "tools": ["read_file", "write_file", "replace"]
    }
  ]
}
```

### Hook Events

- **PreToolUse**: Called before a tool is executed
- **PostToolUse**: Called after a tool completes
- **Stop**: Called when the CLI session ends
- **Notification**: Called for system notifications  
- **SubagentStop**: Called when a subagent stops
- **PreCompact**: Called before conversation compaction

### Hook Script Format

Hook scripts receive JSON input via stdin and should exit with status code 0 for success or 2 to block execution:

```javascript
#!/usr/bin/env node
const fs = require('fs');

// Read hook data from stdin
let inputData = '';
process.stdin.on('data', chunk => inputData += chunk);
process.stdin.on('end', () => {
  const data = JSON.parse(inputData);
  
  // Process the hook data
  console.log(`Tool used: ${data.tool_name}`);
  console.log(`Agent: ${data.agent_type}`); // 'gemini'
  
  // Exit with 0 for success, 2 to block
  process.exit(0);
});
```

The hooks system is compatible with Claude Code hooks, allowing you to use the same hook scripts across both tools.

## Examples

Once the CLI is running, you can start interacting with Gemini from your shell.

You can start a project from a new directory:

```sh
cd new-project/
gemini
> Write me a Gemini Discord bot that answers questions using a FAQ.md file I will provide
```

Or work with an existing project:

```sh
git clone https://github.com/google-gemini/gemini-cli
cd gemini-cli
gemini
> Give me a summary of all of the changes that went in yesterday
```

### Next steps

- Learn how to [contribute to or build from the source](./CONTRIBUTING.md).
- Explore the available **[CLI Commands](./docs/cli/commands.md)**.
- If you encounter any issues, review the **[troubleshooting guide](./docs/troubleshooting.md)**.
- For more comprehensive documentation, see the [full documentation](./docs/index.md).
- Take a look at some [popular tasks](#popular-tasks) for more inspiration.
- Check out our **[Official Roadmap](./ROADMAP.md)**

### Troubleshooting

Head over to the [troubleshooting guide](docs/troubleshooting.md) if you're
having issues.

## GitHub Integration

Integrate Gemini CLI directly into your GitHub workflows with the [**Gemini CLI GitHub Action**](https://github.com/google-github-actions/run-gemini-cli). Key features include:

- **Pull Request Reviews**: Automatically review pull requests when they're opened.
- **Issue Triage**: Automatically triage and label GitHub issues.
- **On-demand Collaboration**: Mention `@gemini-cli` in issues and pull requests for assistance and task delegation.
- **Custom Workflows**: Set up your own scheduled tasks and event-driven automations.

## Popular tasks

### Explore a new codebase

Start by `cd`ing into an existing or newly-cloned repository and running `gemini`.

```text
> Describe the main pieces of this system's architecture.
```

```text
> What security mechanisms are in place?
```

```text
> Provide a step-by-step dev onboarding doc for developers new to the codebase.
```

```text
> Summarize this codebase and highlight the most interesting patterns or techniques I could learn from.
```

```text
> Identify potential areas for improvement or refactoring in this codebase, highlighting parts that appear fragile, complex, or hard to maintain.
```

```text
> Which parts of this codebase might be challenging to scale or debug?
```

```text
> Generate a README section for the [module name] module explaining what it does and how to use it.
```

```text
> What kind of error handling and logging strategies does the project use?
```

```text
> Which tools, libraries, and dependencies are used in this project?
```

### Work with your existing code

```text
> Implement a first draft for GitHub issue #123.
```

```text
> Help me migrate this codebase to the latest version of Java. Start with a plan.
```

### Automate your workflows

Use MCP servers to integrate your local system tools with your enterprise collaboration suite.

```text
> Make me a slide deck showing the git history from the last 7 days, grouped by feature and team member.
```

```text
> Make a full-screen web app for a wall display to show our most interacted-with GitHub issues.
```

### Interact with your system

```text
> Convert all the images in this directory to png, and rename them to use dates from the exif data.
```

```text
> Organize my PDF invoices by month of expenditure.
```

### Uninstall

Head over to the [Uninstall](docs/Uninstall.md) guide for uninstallation instructions.

## Fork Build & Release Process

This fork maintains a feature branch (`add-hooks-feature`) that is continuously rebased on the upstream `main` branch to stay in sync with the original Google Gemini CLI project.

### Building the Project

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build packages:**
   ```bash
   npm run build:packages
   ```

3. **Create the distributable bundle:**
   ```bash
   node esbuild.config.js
   ```
   This creates `bundle/gemini.mjs` - a self-contained executable that users can run with Node.js.

### Creating Releases

1. **Rebase on upstream main:**
   ```bash
   git fetch upstream main
   git rebase upstream/main
   ```

2. **Resolve any conflicts and push:**
   ```bash
   git push --force-with-lease origin add-hooks-feature
   ```

3. **Build the bundle:**
   ```bash
   npm run build:packages
   node esbuild.config.js
   ```

4. **Create a GitHub release:**
   ```bash
   gh release create v0.X.X bundle/gemini.mjs \
     --title "v0.X.X - Release Title" \
     --notes "Release notes here" \
     --target add-hooks-feature \
     --latest
   ```

The release will include the `gemini.mjs` file that users can download and run directly.

### Using Released Versions

Users can download the `gemini.mjs` file from the [Releases](https://github.com/principle-md/gemini-cli/releases) page and run:
```bash
node gemini.mjs
```

## Terms of Service and Privacy Notice

For details on the terms of service and privacy notice applicable to your use of Gemini CLI, see the [Terms of Service and Privacy Notice](./docs/tos-privacy.md).

## Security Disclosures

Please see our [security disclosure process](SECURITY.md). All [security advisories](https://github.com/google-gemini/gemini-cli/security/advisories) are managed on Github.
