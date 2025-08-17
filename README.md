# Gemini CLI

[![Gemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)
[![Version](https://img.shields.io/npm/v/@google/gemini-cli)](https://www.npmjs.com/package/@google/gemini-cli)
[![License](https://img.shields.io/github/license/google-gemini/gemini-cli)](https://github.com/google-gemini/gemini-cli/blob/main/LICENSE)

![Gemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

Gemini CLI is an open-source AI agent that brings the power of Gemini directly into your terminal. It provides lightweight access to Gemini, giving you the most direct path from your prompt to our model.

## 🚀 Why Gemini CLI?

- **🎯 Free tier**: 60 requests/min and 1,000 requests/day with personal Google account
- **🧠 Powerful Gemini 2.5 Pro**: Access to 1M token context window
- **🔧 Built-in tools**: Google Search grounding, file operations, shell commands, web fetching
- **🔌 Extensible**: MCP (Model Context Protocol) support for custom integrations
- **💻 Terminal-first**: Designed for developers who live in the command line
- **🛡️ Open source**: Apache 2.0 licensed

## 📦 Installation

### Quick Install

#### Run instantly with npx

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

## 📋 Key Features

### Code Understanding & Generation

- Query and edit large codebases
- Generate new apps from PDFs, images, or sketches using multimodal capabilities
- Debug issues and troubleshoot with natural language

### Automation & Integration

- Automate operational tasks like querying pull requests or handling complex rebases
- Use MCP servers to connect new capabilities, including [media generation with Imagen, Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Run non-interactively in scripts for workflow automation

### Advanced Capabilities

- Ground your queries with built-in [Google Search](https://ai.google.dev/gemini-api/docs/grounding) for real-time information
- Conversation checkpointing to save and resume complex sessions
- Custom context files (GEMINI.md) to tailor behavior for your projects

### GitHub Integration

Integrate Gemini CLI directly into your GitHub workflows with [**Gemini CLI GitHub Action**](https://github.com/google-github-actions/run-gemini-cli):

- **Pull Request Reviews**: Automated code review with contextual feedback and suggestions
- **Issue Triage**: Automated labeling and prioritization of GitHub issues based on content analysis
- **On-demand Assistance**: Mention `@gemini-cli` in issues and pull requests for help with debugging, explanations, or task delegation
- **Custom Workflows**: Build automated, scheduled and on-demand workflows tailored to your team's needs

## 🔐 Authentication Options

Choose the authentication method that best fits your needs:

### Option 1: OAuth login (Using your Google Account)

**✨ Best for:** Individual developers as well as anyone who has a Gemini Code Assist License. (see [quota limits and terms of service](https://cloud.google.com/gemini/docs/quotas) for details)

**Benefits:**

- **Free tier**: 60 requests/min and 1,000 requests/day
- **Gemini 2.5 Pro** with 1M token context window
- **No API key management** - just sign in with your Google account
- **Automatic updates** to latest models

#### Start Gemini CLI, then choose OAuth and follow the browser authentication flow when prompted

```bash
gemini
```

#### If you are using a paid Code Assist License from your organization, remember to set the Google Cloud Project

```bash
# Set your Google Cloud Project
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_NAME"
gemini
```

### Option 2: Gemini API Key

**✨ Best for:** Developers who need specific model control or paid tier access

**Benefits:**

- **Free tier**: 100 requests/day with Gemini 2.5 Pro
- **Model selection**: Choose specific Gemini models
- **Usage-based billing**: Upgrade for higher limits when needed

```bash
# Get your key from https://aistudio.google.com/apikey
export GEMINI_API_KEY="YOUR_API_KEY"
gemini
```

### Option 3: Vertex AI

**✨ Best for:** Enterprise teams and production workloads

**Benefits:**

- **Enterprise features**: Advanced security and compliance
- **Scalable**: Higher rate limits with billing account
- **Integration**: Works with existing Google Cloud infrastructure

```bash
# Get your key from Google Cloud Console
export GOOGLE_API_KEY="YOUR_API_KEY"
export GOOGLE_GENAI_USE_VERTEXAI=true
gemini
```

For Google Workspace accounts and other authentication methods, see the [authentication guide](./docs/cli/authentication.md).

## 🚀 Getting Started

### Basic Usage

#### Start in current directory

```bash
gemini
```

#### Include multiple directories

```bash
gemini --include-directories ../lib,../docs
```

#### Use specific model

```bash
gemini -m gemini-2.5-flash
```

#### Non-interactive mode for scripts

```bash
gemini -p "Explain the architecture of this codebase"
```

### Quick Examples

#### Start a new project

````bash
cd new-project/
gemini
> Write me a Discord bot that answers questions using a FAQ.md file I will provide

#### Analyze existing code
```bash
git clone https://github.com/google-gemini/gemini-cli
cd gemini-cli
gemini
> Give me a summary of all of the changes that went in yesterday
````

## 📚 Documentation

### Getting Started

- [**Quickstart Guide**](./docs/cli/index.md) - Get up and running quickly
- [**Authentication Setup**](./docs/cli/authentication.md) - Detailed auth configuration
- [**Configuration Guide**](./docs/cli/configuration.md) - Settings and customization
- [**Keyboard Shortcuts**](./docs/keyboard-shortcuts.md) - Productivity tips

### Core Features

- [**Commands Reference**](./docs/cli/commands.md) - All slash commands (`/help`, `/chat`, `/mcp`, etc.)
- [**Checkpointing**](./docs/checkpointing.md) - Save and resume conversations
- [**Memory Management**](./docs/tools/memory.md) - Using GEMINI.md context files
- [**Token Caching**](./docs/cli/token-caching.md) - Optimize token usage

### Tools & Extensions

- [**Built-in Tools Overview**](./docs/tools/index.md)
  - [File System Operations](./docs/tools/file-system.md)
  - [Shell Commands](./docs/tools/shell.md)
  - [Web Fetch & Search](./docs/tools/web-fetch.md)
  - [Multi-file Operations](./docs/tools/multi-file.md)
- [**MCP Server Integration**](./docs/tools/mcp-server.md) - Extend with custom tools
- [**Custom Extensions**](./docs/extension.md) - Build your own commands

### Advanced Topics

- [**Architecture Overview**](./docs/architecture.md) - How Gemini CLI works
- [**IDE Integration**](./docs/ide-integration.md) - VS Code companion
- [**Sandboxing & Security**](./docs/sandbox.md) - Safe execution environments
- [**Enterprise Deployment**](./docs/deployment.md) - Docker, system-wide config
- [**Telemetry & Monitoring**](./docs/telemetry.md) - Usage tracking
- [**Tools API Development**](./docs/core/tools-api.md) - Create custom tools

### Configuration & Customization

- [**Settings Reference**](./docs/cli/configuration.md) - All configuration options
- [**Theme Customization**](./docs/cli/themes.md) - Visual customization
- [**.gemini Directory**](./docs/gemini-ignore.md) - Project-specific settings
- [**Environment Variables**](./docs/cli/configuration.md#environment-variables)

### Troubleshooting & Support

- [**Troubleshooting Guide**](./docs/troubleshooting.md) - Common issues and solutions
- [**FAQ**](./docs/troubleshooting.md#frequently-asked-questions) - Quick answers
- Use `/bug` command to report issues directly from the CLI

### Using MCP Servers

Configure MCP servers in `~/.gemini/settings.json` to extend Gemini CLI with custom tools:

```text
> @github List my open pull requests
> @slack Send a summary of today's commits to #dev channel
> @database Run a query to find inactive users
```

See the [MCP Server Integration guide](./docs/tools/mcp-server.md) for setup instructions.

## 🤝 Contributing

We welcome contributions! Gemini CLI is fully open source (Apache 2.0), and we encourage the community to:

- Report bugs and suggest features
- Improve documentation
- Submit code improvements
- Share your MCP servers and extensions

See our [Contributing Guide](./CONTRIBUTING.md) for development setup, coding standards, and how to submit pull requests.

Check our [Official Roadmap](https://github.com/orgs/google-gemini/projects/11/) for planned features and priorities.

## 📖 Resources

- **[Official Roadmap](./ROADMAP.md)** - See what's coming next
- **[NPM Package](https://www.npmjs.com/package/@google/gemini-cli)** - Package registry
- **[GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)** - Report bugs or request features
- **[Security Advisories](https://github.com/google-gemini/gemini-cli/security/advisories)** - Security updates

### Uninstall

See the [Uninstall Guide](docs/Uninstall.md) for removal instructions.

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

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Terms of Service**: [Terms & Privacy](./docs/tos-privacy.md)
- **Security**: [Security Policy](SECURITY.md)

---

<p align="center">
  Built with ❤️ by Google and the open source community
</p>
